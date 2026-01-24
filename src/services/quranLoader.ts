// Quran Loader Service
import { getDatabase } from '../database/init';
import quranData from '../data/quran.json';

interface QuranVerse {
    number: number;
    textArabic: string;
    textPortuguese: string;
}

interface QuranSurah {
    number: number;
    name: string;
    nameArabic: string;
    verses: QuranVerse[];
}

/**
 * Check if Quran is already loaded
 */
export async function isQuranLoaded(): Promise<boolean> {
    const db = getDatabase();
    const result = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM quran_verses'
    ) as { count: number };

    return result.count > 0;
}

/**
 * Load Quran from bundled JSON
 */
export async function loadQuran(): Promise<boolean> {
    try {
        console.log('☪ Loading Quran...');
        const db = getDatabase();

        const surahs = quranData as QuranSurah[];
        console.log(`📄 Found ${surahs.length} surahs to load`);

        for (const surah of surahs) {
            for (const verse of surah.verses) {
                await db.runAsync(
                    `INSERT OR REPLACE INTO quran_verses (surah_number, verse_number, text_arabic, text_portuguese)
                     VALUES (?, ?, ?, ?)`,
                    surah.number,
                    verse.number,
                    verse.textArabic,
                    verse.textPortuguese
                );
            }

            console.log(`✅ Loaded: Surah ${surah.number} - ${surah.name}`);
        }

        console.log(`✅ Successfully loaded ${surahs.length} surahs`);
        return true;
    } catch (error) {
        console.error('❌ Error loading Quran:', error);
        return false;
    }
}

/**
 * Get Quran loading stats
 */
export async function getQuranStats(): Promise<{ totalVerses: number; surahsLoaded: number }> {
    const db = getDatabase();

    const versesResult = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM quran_verses'
    ) as { count: number };

    const surahsResult = await db.getFirstAsync(
        'SELECT COUNT(DISTINCT surah_number) as count FROM quran_verses'
    ) as { count: number };

    return {
        totalVerses: versesResult.count,
        surahsLoaded: surahsResult.count
    };
}
