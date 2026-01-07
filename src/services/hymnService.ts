// Hymn Service - Harpa Cristã
import { getDatabase } from '../database/init';

export interface Hymn {
    id: number;
    number: number;
    title: string;
    lyrics: string;
    category?: string;
}

/**
 * Get all hymns
 */
export async function getAllHymns(): Promise<Hymn[]> {
    const db = getDatabase();
    const hymns = await db.getAllAsync('SELECT * FROM hymns ORDER BY number ASC');
    return hymns as Hymn[];
}

/**
 * Get hymn by number
 */
export async function getHymnByNumber(number: number): Promise<Hymn | null> {
    const db = getDatabase();
    const hymn = await db.getFirstAsync(
        'SELECT * FROM hymns WHERE number = ?',
        number
    );
    return hymn as Hymn | null;
}

/**
 * Search hymns by title or lyrics
 */
export async function searchHymns(query: string): Promise<Hymn[]> {
    const db = getDatabase();
    const searchTerm = `%${query}%`;
    const hymns = await db.getAllAsync(
        'SELECT * FROM hymns WHERE title LIKE ? OR lyrics LIKE ? ORDER BY number ASC',
        searchTerm,
        searchTerm
    );
    return hymns as Hymn[];
}

/**
 * Get hymns by category
 */
export async function getHymnsByCategory(category: string): Promise<Hymn[]> {
    const db = getDatabase();
    const hymns = await db.getAllAsync(
        'SELECT * FROM hymns WHERE category = ? ORDER BY number ASC',
        category
    );
    return hymns as Hymn[];
}

/**
 * Add hymn (for initial data loading)
 */
export async function addHymn(hymn: Omit<Hymn, 'id'>): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
        `INSERT OR REPLACE INTO hymns (number, title, lyrics, category)
     VALUES (?, ?, ?, ?)`,
        hymn.number,
        hymn.title,
        hymn.lyrics,
        hymn.category || null
    );
}

/**
 * Get hymn count
 */
export async function getHymnCount(): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM hymns'
    ) as { count: number };
    return result.count;
}
