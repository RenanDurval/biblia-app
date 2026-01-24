// Reading History Service
// Tracks user's reading history

import { getDatabase } from '../database/init';
import { ReadingHistory } from '../types';

/**
 * Add reading history entry
 */
export async function addReadingHistory(
    bookId: number,
    chapterNumber: number
): Promise<void> {
    const db = getDatabase();
    const id = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Check if already exists today
    const today = new Date().toISOString().split('T')[0];
    const existing = await db.getFirstAsync(
        `SELECT id FROM reading_history 
     WHERE book_id = ? AND chapter_number = ? AND timestamp LIKE ?`,
        bookId,
        chapterNumber,
        `${today}%`
    );

    if (existing) {
        // Update timestamp
        await db.runAsync(
            'UPDATE reading_history SET timestamp = ? WHERE id = ?',
            timestamp,
            (existing as any).id
        );
    } else {
        // Insert new entry
        await db.runAsync(
            `INSERT INTO reading_history (id, book_id, chapter_number, timestamp)
       VALUES (?, ?, ?, ?)`,
            id,
            bookId,
            chapterNumber,
            timestamp
        );
    }
}

/**
 * Get reading history (recent first)
 */
export async function getReadingHistory(limit: number = 10): Promise<ReadingHistory[]> {
    const db = getDatabase();
    const result = await db.getAllAsync(
        `SELECT * FROM reading_history 
     ORDER BY timestamp DESC 
     LIMIT ?`,
        limit
    );
    return result as ReadingHistory[];
}

/**
 * Get unique books from history
 */
export async function getUniqueHistoryBooks(): Promise<number[]> {
    const db = getDatabase();
    const result = await db.getAllAsync(
        `SELECT DISTINCT book_id FROM reading_history 
     ORDER BY timestamp DESC`
    );
    return result.map((row: any) => row.book_id);
}

/**
 * Clear all reading history
 */
export async function clearReadingHistory(): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM reading_history');
    console.log('🗑️ Reading history cleared');
}

/**
 * Get reading streak (consecutive days)
 */
export async function getReadingStreak(): Promise<number> {
    const db = getDatabase();

    // Get all distinct dates
    const result = await db.getAllAsync(
        `SELECT DISTINCT date(timestamp) as date 
     FROM reading_history 
     ORDER BY date DESC`
    );

    if (result.length === 0) return 0;

    let streak = 1;
    const dates = result.map((r: any) => new Date(r.date));

    for (let i = 0; i < dates.length - 1; i++) {
        const diff = Math.floor((dates[i].getTime() - dates[i + 1].getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Get reading stats
 */
export async function getReadingStats(): Promise<{
    totalChaptersRead: number;
    uniqueBooksRead: number;
    readingStreak: number;
    lastRead: string | null;
}> {
    const db = getDatabase();

    const countResult = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM reading_history'
    ) as { count: number };

    const uniqueBooksResult = await db.getFirstAsync(
        'SELECT COUNT(DISTINCT book_id) as count FROM reading_history'
    ) as { count: number };

    const lastReadResult = await db.getFirstAsync(
        'SELECT timestamp FROM reading_history ORDER BY timestamp DESC LIMIT 1'
    ) as { timestamp: string } | null;

    const streak = await getReadingStreak();

    return {
        totalChaptersRead: countResult.count,
        uniqueBooksRead: uniqueBooksResult.count,
        readingStreak: streak,
        lastRead: lastReadResult?.timestamp || null,
    };
}
