// Bookmark Service
// Manages user bookmarks (favorite verses)

import { getDatabase } from '../database/init';
import { Bookmark } from '../types';

/**
 * Add a bookmark
 */
export async function addBookmark(
    bookId: number,
    chapterNumber: number,
    verseNumber: number,
    note?: string
): Promise<string> {
    const db = getDatabase();
    const id = `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    await db.runAsync(
        `INSERT INTO bookmarks (id, book_id, chapter_number, verse_number, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
        id,
        bookId,
        chapterNumber,
        verseNumber,
        note || null,
        createdAt
    );

    console.log('✅ Bookmark added:', id);
    return id;
}

/**
 * Remove a bookmark by ID
 */
export async function removeBookmark(id: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM bookmarks WHERE id = ?', id);
    console.log('🗑️ Bookmark removed:', id);
}

/**
 * Remove bookmark by verse coordinates
 */
export async function removeBookmarkByVerse(
    bookId: number,
    chapterNumber: number,
    verseNumber: number
): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
        'DELETE FROM bookmarks WHERE book_id = ? AND chapter_number = ? AND verse_number = ?',
        bookId,
        chapterNumber,
        verseNumber
    );
    console.log('🗑️ Bookmark removed by verse');
}

/**
 * Get all bookmarks
 */
export async function getAllBookmarks(): Promise<Bookmark[]> {
    const db = getDatabase();
    const result = await db.getAllAsync(
        'SELECT * FROM bookmarks ORDER BY created_at DESC'
    );
    return result as Bookmark[];
}

/**
 * Check if a verse is bookmarked
 */
export async function isBookmarked(
    bookId: number,
    chapterNumber: number,
    verseNumber: number
): Promise<boolean> {
    const db = getDatabase();

    const result = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM bookmarks 
     WHERE book_id = ? AND chapter_number = ? AND verse_number = ?`,
        bookId,
        chapterNumber,
        verseNumber
    ) as { count: number };

    return result.count > 0;
}

/**
 * Get bookmark for specific verse
 */
export async function getBookmarkForVerse(
    bookId: number,
    chapterNumber: number,
    verseNumber: number
): Promise<Bookmark | null> {
    const db = getDatabase();

    const result = await db.getFirstAsync(
        `SELECT * FROM bookmarks 
     WHERE book_id = ? AND chapter_number = ? AND verse_number = ?`,
        bookId,
        chapterNumber,
        verseNumber
    );

    return result as Bookmark | null;
}

/**
 * Update bookmark note
 */
export async function updateBookmarkNote(id: string, note: string): Promise<void> {
    const db = getDatabase();
    await db.runAsync('UPDATE bookmarks SET note = ? WHERE id = ?', note, id);
    console.log('📝 Bookmark note updated');
}

/**
 * Get bookmarks count
 */
export async function getBookmarksCount(): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync('SELECT COUNT(*) as count FROM bookmarks') as { count: number };
    return result.count;
}
