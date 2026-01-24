// Hymns Loader Service - Harpa Cristã
import { getDatabase } from '../database/init';
import hymnsData from '../data/hymns.json';

interface HymnData {
    number: number;
    title: string;
    lyrics: string;
    category?: string;
}

/**
 * Check if hymns are already loaded
 */
export async function areHymnsLoaded(): Promise<boolean> {
    const db = getDatabase();
    const result = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM hymns'
    ) as { count: number };

    return result.count > 0;
}

/**
 * Load all hymns from bundled JSON
 */
export async function loadHymns(): Promise<boolean> {
    try {
        console.log('🎵 Loading Harpa Cristã hymns...');
        const db = getDatabase();

        const hymns = hymnsData as HymnData[];
        console.log(`📄 Found ${hymns.length} hymns to load`);

        for (const hymn of hymns) {
            await db.runAsync(
                `INSERT OR REPLACE INTO hymns (number, title, lyrics, category)
                 VALUES (?, ?, ?, ?)`,
                hymn.number,
                hymn.title,
                hymn.lyrics,
                hymn.category || null
            );
        }

        console.log(`✅ Successfully loaded ${hymns.length} hymns`);
        return true;
    } catch (error) {
        console.error('❌ Error loading hymns:', error);
        return false;
    }
}

/**
 * Get hymns loading stats
 */
export async function getHymnsStats(): Promise<{ totalHymns: number }> {
    const db = getDatabase();
    const result = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM hymns'
    ) as { count: number };

    return { totalHymns: result.count };
}
