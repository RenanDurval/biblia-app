// Bible Content Service
// Handles fetching and caching Bible verses from APIs or local storage

import { getDatabase } from '../database/init';
import { Verse, Book, Chapter } from '../types';

/**
 * Get all available Bible versions
 */
export async function getBibleVersions() {
    const db = getDatabase();
    const result = await db.getAllAsync('SELECT * FROM bible_versions');
    return result;
}

/**
 * Get all books for a specific testament
 */
export async function getBooks(testament?: 'OT' | 'NT' | 'APOCRYPHA' | 'TORAH' | 'QURAN'): Promise<Book[]> {
    const db = getDatabase();

    let query = 'SELECT * FROM books';
    const params: any[] = [];

    if (testament) {
        if (testament === 'TORAH') {
            query += ' WHERE id BETWEEN 1 AND 5 ORDER BY book_order';
        } else {
            query += ' WHERE testament = ? ORDER BY book_order';
            params.push(testament);
        }
    } else {
        query += ' ORDER BY book_order';
    }

    const result = await db.getAllAsync(query, params);
    return result as Book[];
}

/**
 * Get a specific book by ID
 */
export async function getBook(bookId: number): Promise<Book | null> {
    const db = getDatabase();
    const result = await db.getFirstAsync('SELECT * FROM books WHERE id = ?', bookId);
    return result as Book | null;
}

/**
 * Get verses for a specific chapter
 */
export async function getChapterVerses(
    bookId: number,
    chapterNumber: number,
    versionId: string = 'acf'
): Promise<Verse[]> {
    const db = getDatabase();

    const query = `
    SELECT 
      id,
      book_id AS bookId,
      chapter_number AS chapterNumber,
      verse_number AS verseNumber,
      text,
      version_id AS versionId
    FROM verses 
    WHERE book_id = ? AND chapter_number = ? AND version_id = ?
    ORDER BY verse_number
  `;

    const result = await db.getAllAsync(query, [bookId, chapterNumber, versionId]);
    console.log(`📖 Loaded ${result.length} verses for book ${bookId}, chapter ${chapterNumber}`);
    return result as Verse[];
}

/**
 * Get a single verse
 */
export async function getVerse(
    bookId: number,
    chapterNumber: number,
    verseNumber: number,
    versionId: string = 'acf'
): Promise<Verse | null> {
    const db = getDatabase();

    const query = `
    SELECT 
      id,
      book_id AS bookId,
      chapter_number AS chapterNumber,
      verse_number AS verseNumber,
      text,
      version_id AS versionId
    FROM verses 
    WHERE book_id = ? AND chapter_number = ? AND verse_number = ? AND version_id = ?
  `;

    const result = await db.getFirstAsync(query, [bookId, chapterNumber, verseNumber, versionId]);
    return result as Verse | null;
}

/**
 * Search verses by text
 */
export async function searchVerses(
    searchText: string,
    versionId: string = 'acf'
): Promise<Verse[]> {
    const db = getDatabase();

    const query = `
    SELECT 
      id,
      book_id AS bookId,
      chapter_number AS chapterNumber,
      verse_number AS verseNumber,
      text,
      version_id AS versionId
    FROM verses 
    WHERE version_id = ? AND LOWER(text) LIKE LOWER(?)
    LIMIT 100
  `;

    const result = await db.getAllAsync(query, [versionId, `%${searchText}%`]);
    console.log(`🔍 Search for "${searchText}" found ${result.length} results`);
    return result as Verse[];
}

/**
 * Get random verse for daily verse
 */
export async function getRandomVerse(versionId: string = 'acf'): Promise<Verse | null> {
    const db = getDatabase();

    const query = `
    SELECT 
      id,
      book_id AS bookId,
      chapter_number AS chapterNumber,
      verse_number AS verseNumber,
      text,
      version_id AS versionId
    FROM verses 
    WHERE version_id = ?
    ORDER BY RANDOM()
    LIMIT 1
  `;

    const result = await db.getFirstAsync(query, [versionId]);
    return result as Verse | null;
}

/**
 * Insert verse into database
 * Used when downloading content from API
 */
export async function insertVerse(verse: Omit<Verse, 'id'>): Promise<void> {
    const db = getDatabase();

    const query = `
    INSERT OR REPLACE INTO verses (book_id, chapter_number, verse_number, text, version_id)
    VALUES (?, ?, ?, ?, ?)
  `;

    await db.runAsync(
        query,
        verse.bookId,
        verse.chapterNumber,
        verse.verseNumber,
        verse.text,
        verse.versionId
    );
}

/**
 * Check if a chapter is already downloaded
 */
export async function isChapterDownloaded(
    bookId: number,
    chapterNumber: number,
    versionId: string
): Promise<boolean> {
    const db = getDatabase();

    const query = `
    SELECT COUNT(*) as count FROM verses 
    WHERE book_id = ? AND chapter_number = ? AND version_id = ?
  `;

    const result = await db.getFirstAsync(query, [bookId, chapterNumber, versionId]) as { count: number };
    return result.count > 0;
}
