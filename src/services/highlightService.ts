// Verse Highlight Service
// Manages verse highlights (marker/highlighter functionality)

import { getDatabase } from '../database/init';
import { VerseHighlight } from '../types';

export const HIGHLIGHT_COLORS = {
    yellow: '#FFF59D',   // Amarelo claro
    green: '#A5D6A7',    // Verde claro
    blue: '#90CAF9',     // Azul claro
    pink: '#F48FB1',     // Rosa claro
    orange: '#FFCC80',   // Laranja claro
} as const;

/**
 * Add or update highlight for a verse
 */
export async function addHighlight(
    bookId: number,
    chapterNumber: number,
    verseNumber: number,
    color: keyof typeof HIGHLIGHT_COLORS
): Promise<string> {
    const db = getDatabase();
    const id = `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    // Delete existing highlight for this verse if any
    await db.runAsync(
        'DELETE FROM verse_highlights WHERE book_id = ? AND chapter_number = ? AND verse_number = ?',
        bookId,
        chapterNumber,
        verseNumber
    );

    // Insert new highlight
    await db.runAsync(
        `INSERT INTO verse_highlights (id, book_id, chapter_number, verse_number, color, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
        id,
        bookId,
        chapterNumber,
        verseNumber,
        color,
        createdAt
    );

    console.log('🖍️ Highlight added:', color);
    return id;
}

/**
 * Remove highlight from a verse
 */
export async function removeHighlight(
    bookId: number,
    chapterNumber: number,
    verseNumber: number
): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
        'DELETE FROM verse_highlights WHERE book_id = ? AND chapter_number = ? AND verse_number = ?',
        bookId,
        chapterNumber,
        verseNumber
    );
    console.log('🗑️ Highlight removed');
}

/**
 * Get all highlights for a chapter
 */
export async function getChapterHighlights(
    bookId: number,
    chapterNumber: number
): Promise<VerseHighlight[]> {
    const db = getDatabase();
    const result = await db.getAllAsync(
        'SELECT * FROM verse_highlights WHERE book_id = ? AND chapter_number = ?',
        bookId,
        chapterNumber
    );
    return result as VerseHighlight[];
}

/**
 * Get highlight for a specific verse
 */
export async function getVerseHighlight(
    bookId: number,
    chapterNumber: number,
    verseNumber: number
): Promise<VerseHighlight | null> {
    const db = getDatabase();
    const result = await db.getFirstAsync(
        'SELECT * FROM verse_highlights WHERE book_id = ? AND chapter_number = ? AND verse_number = ?',
        bookId,
        chapterNumber,
        verseNumber
    );
    return result as VerseHighlight | null;
}

/**
 * Get all highlights for user
 */
export async function getAllHighlights(): Promise<VerseHighlight[]> {
    const db = getDatabase();
    const result = await db.getAllAsync(
        'SELECT * FROM verse_highlights ORDER BY created_at DESC'
    );
    return result as VerseHighlight[];
}

/**
 * Count highlights
 */
export async function getHighlightsCount(): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM verse_highlights'
    ) as { count: number };
    return result.count;
}
