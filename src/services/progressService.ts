// Reading Progress Service
// Tracks and calculates real reading progress

import { getDatabase } from '../database/init';

// Total chapters in the Bible
const TOTAL_CHAPTERS = 1189;
const TOTAL_OT_CHAPTERS = 929;
const TOTAL_NT_CHAPTERS = 260;

/**
 * Get overall reading progress
 */
export async function getReadingProgress(): Promise<{
    chaptersRead: number;
    totalChapters: number;
    percentage: number;
    booksCompleted: number;
}> {
    const db = getDatabase();

    // Count unique chapters read
    const chaptersResult = await db.getFirstAsync(
        `SELECT COUNT(DISTINCT book_id || '-' || chapter_number) as count 
     FROM reading_history`
    ) as { count: number };

    const chaptersRead = chaptersResult.count;
    const percentage = parseFloat(((chaptersRead / TOTAL_CHAPTERS) * 100).toFixed(2));

    // Count completed books
    const booksResult = await db.getAllAsync(
        `SELECT book_id, COUNT(DISTINCT chapter_number) as chapters_read
     FROM reading_history
     GROUP BY book_id`
    ) as Array<{ book_id: number; chapters_read: number }>;

    // Get book info to check if completed
    const { getBook } = await import('./bibleService');
    let booksCompleted = 0;

    for (const bookProgress of booksResult) {
        const book = await getBook(bookProgress.book_id);
        if (book && bookProgress.chapters_read >= book.chapters) {
            booksCompleted++;
        }
    }

    return {
        chaptersRead,
        totalChapters: TOTAL_CHAPTERS,
        percentage,
        booksCompleted,
    };
}

/**
 * Get progress for a specific book
 */
export async function getBookProgress(bookId: number): Promise<{
    chaptersRead: number;
    totalChapters: number;
    percentage: number;
    isCompleted: boolean;
}> {
    const db = getDatabase();
    const { getBook } = await import('./bibleService');

    const book = await getBook(bookId);
    if (!book) {
        return { chaptersRead: 0, totalChapters: 0, percentage: 0, isCompleted: false };
    }

    const result = await db.getFirstAsync(
        `SELECT COUNT(DISTINCT chapter_number) as count
     FROM reading_history
     WHERE book_id = ?`,
        bookId
    ) as { count: number };

    const chaptersRead = result.count;
    const percentage = parseFloat(((chaptersRead / book.chapters) * 100).toFixed(2));
    const isCompleted = chaptersRead >= book.chapters;

    return {
        chaptersRead,
        totalChapters: book.chapters,
        percentage,
        isCompleted,
    };
}

/**
 * Get list of all books with their progress
 */
export async function getAllBooksProgress(): Promise<Array<{
    bookId: number;
    bookName: string;
    chaptersRead: number;
    totalChapters: number;
    percentage: number;
    isCompleted: boolean;
}>> {
    const { getBooks } = await import('./bibleService');
    const books = await getBooks();

    const booksWithProgress = await Promise.all(
        books.map(async (book) => {
            const progress = await getBookProgress(book.id);
            return {
                bookId: book.id,
                bookName: book.name,
                ...progress,
            };
        })
    );

    return booksWithProgress;
}

/**
 * Get reading statistics
 */
export async function getDetailedStats(): Promise<{
    totalProgress: number;
    chaptersRead: number;
    booksCompleted: number;
    readingStreak: number;
    lastRead: string | null;
    otProgress: number;
    ntProgress: number;
}> {
    const db = getDatabase();
    const { getReadingStreak, getReadingStats } = await import('./historyService');

    const overallProgress = await getReadingProgress();
    const stats = await getReadingStats();

    // Calculate OT and NT progress
    const otResult = await db.getFirstAsync(
        `SELECT COUNT(DISTINCT book_id || '-' || chapter_number) as count
     FROM reading_history
     WHERE book_id BETWEEN 1 AND 39`
    ) as { count: number };

    const ntResult = await db.getFirstAsync(
        `SELECT COUNT(DISTINCT book_id || '-' || chapter_number) as count
     FROM reading_history
     WHERE book_id BETWEEN 40 AND 66`
    ) as { count: number };

    return {
        totalProgress: overallProgress.percentage,
        chaptersRead: overallProgress.chaptersRead,
        booksCompleted: overallProgress.booksCompleted,
        readingStreak: stats.readingStreak,
        lastRead: stats.lastRead,
        otProgress: parseFloat(((otResult.count / TOTAL_OT_CHAPTERS) * 100).toFixed(2)),
        ntProgress: parseFloat(((ntResult.count / TOTAL_NT_CHAPTERS) * 100).toFixed(2)),
    };
}
