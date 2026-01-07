// Complete Bible Loader Service
// Downloads and inserts complete Bible on first run

import { getDatabase } from '../database/init';

const BIBLE_JSON_URL = 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json';

interface BibleBook {
    abbrev: string;
    chapters: string[][];
}

/**
 * Check if Bible is already loaded
 */
export async function isBibleLoaded(): Promise<boolean> {
    const db = getDatabase();
    const result = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM verses'
    ) as { count: number };

    // If more than 1000 verses, consider it loaded
    return result.count > 1000;
}

/**
 * Download and load complete Bible
 */
export async function loadCompleteBible(
    onProgress?: (current: number, total: number, bookName: string) => void
): Promise<boolean> {
    try {
        console.log('📥 Downloading complete Bible...');

        // Download JSON
        const response = await fetch(BIBLE_JSON_URL);
        if (!response.ok) {
            console.error('Failed to download Bible');
            return false;
        }

        const bibleData: BibleBook[] = await response.json();
        console.log(`📖 Downloaded ${bibleData.length} books`);

        const db = getDatabase();
        const totalBooks = bibleData.length;

        // Book ID mapping
        const bookMapping: { [key: string]: number } = {
            'gn': 1, 'ex': 2, 'lv': 3, 'nm': 4, 'dt': 5, 'js': 6, 'jz': 7, 'rt': 8,
            '1sm': 9, '2sm': 10, '1rs': 11, '2rs': 12, '1cr': 13, '2cr': 14,
            'ed': 15, 'ne': 16, 'et': 17, 'job': 18, 'sl': 19, 'pv': 20,
            'ec': 21, 'ct': 22, 'is': 23, 'jr': 24, 'lm': 25, 'ez': 26, 'dn': 27,
            'os': 28, 'jl': 29, 'am': 30, 'ob': 31, 'jn': 32, 'mq': 33, 'na': 34,
            'hc': 35, 'sf': 36, 'ag': 37, 'zc': 38, 'ml': 39,
            'mt': 40, 'mc': 41, 'lc': 42, 'jo': 43, 'at': 44, 'rm': 45,
            '1co': 46, '2co': 47, 'gl': 48, 'ef': 49, 'fp': 50, 'cl': 51,
            '1ts': 52, '2ts': 53, '1tm': 54, '2tm': 55, 'tt': 56, 'fm': 57,
            'hb': 58, 'tg': 59, '1pe': 60, '2pe': 61, '1jo': 62, '2jo': 63,
            '3jo': 64, 'jd': 65, 'ap': 66
        };

        let processedBooks = 0;

        for (const book of bibleData) {
            const bookId = bookMapping[book.abbrev.toLowerCase()];

            if (!bookId) {
                console.log(`⚠️ Skipping unknown book: ${book.abbrev}`);
                continue;
            }

            // Get book name for progress
            const bookInfo = await db.getFirstAsync(
                'SELECT name FROM books WHERE id = ?',
                bookId
            ) as { name: string } | null;

            const bookName = bookInfo?.name || book.abbrev;

            // Insert all chapters and verses
            for (let chapterIdx = 0; chapterIdx < book.chapters.length; chapterIdx++) {
                const chapterNumber = chapterIdx + 1;
                const verses = book.chapters[chapterIdx];

                for (let verseIdx = 0; verseIdx < verses.length; verseIdx++) {
                    const verseNumber = verseIdx + 1;
                    const verseText = verses[verseIdx];

                    // Insert verse
                    await db.runAsync(
                        `INSERT OR REPLACE INTO verses (book_id, chapter_number, verse_number, text, version_id)
             VALUES (?, ?, ?, ?, ?)`,
                        bookId,
                        chapterNumber,
                        verseNumber,
                        verseText,
                        'acf'
                    );
                }
            }

            processedBooks++;

            if (onProgress) {
                onProgress(processedBooks, totalBooks, bookName);
            }

            console.log(`✅ Loaded: ${bookName} (${processedBooks}/${totalBooks})`);
        }

        console.log('🎉 Complete Bible loaded successfully!');
        return true;

    } catch (error) {
        console.error('❌ Error loading Bible:', error);
        return false;
    }
}

/**
 * Get loading stats
 */
export async function getBibleStats(): Promise<{
    totalVerses: number;
    totalChapters: number;
    booksLoaded: number;
}> {
    const db = getDatabase();

    const versesResult = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM verses'
    ) as { count: number };

    const chaptersResult = await db.getFirstAsync(
        'SELECT COUNT(DISTINCT book_id || "-" || chapter_number) as count FROM verses'
    ) as { count: number };

    const booksResult = await db.getFirstAsync(
        'SELECT COUNT(DISTINCT book_id) as count FROM verses'
    ) as { count: number };

    return {
        totalVerses: versesResult.count,
        totalChapters: chaptersResult.count,
        booksLoaded: booksResult.count,
    };
}
