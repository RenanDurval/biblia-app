// Complete Bible Loader Service  
// Loads complete Bible from bundled JSON for 100% offline functionality

import { getDatabase } from '../database/init';
import bibleDataRaw from '../data/bible.json';

// Bible data is bundled in the app for offline use

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
        console.log('📖 Loading complete Bible from bundled data...');
        const startTime = Date.now();

        // Use pre-loaded Bible data (bundled in app)
        const bibleData = bibleDataRaw as BibleBook[];

        console.log(`📄 Loaded ${bibleData.length} books from bundled JSON`);

        if (!Array.isArray(bibleData) || bibleData.length === 0) {
            console.error('Invalid Bible data format');
            return false;
        }

        console.log(`📖 Parsed ${bibleData.length} books in ${(Date.now() - startTime) / 1000}s`);

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

            // Use transaction for each book with batch inserts
            await db.withTransactionAsync(async () => {
                const batchSize = 100;
                const allVerses: any[] = [];

                // Collect all verses for this book
                for (let chapterIdx = 0; chapterIdx < book.chapters.length; chapterIdx++) {
                    const chapterNumber = chapterIdx + 1;
                    const verses = book.chapters[chapterIdx];

                    for (let verseIdx = 0; verseIdx < verses.length; verseIdx++) {
                        const verseNumber = verseIdx + 1;
                        const verseText = verses[verseIdx];
                        allVerses.push([bookId, chapterNumber, verseNumber, verseText, 'acf']);
                    }
                }

                // Insert in batches for better performance
                for (let i = 0; i < allVerses.length; i += batchSize) {
                    const batch = allVerses.slice(i, i + batchSize);
                    const placeholders = batch.map(() => '(?, ?, ?, ?, ?)').join(', ');
                    const flatValues = batch.flat();

                    await db.runAsync(
                        `INSERT OR REPLACE INTO verses (book_id, chapter_number, verse_number, text, version_id) VALUES ${placeholders}`,
                        ...flatValues
                    );
                }
            });

            processedBooks++;

            if (onProgress) {
                onProgress(processedBooks, totalBooks, bookName);
            }

            console.log(`✅ Loaded: ${bookName} (${processedBooks}/${totalBooks})`);
        }

        const totalTime = (Date.now() - startTime) / 1000;
        console.log(`🎉 Complete Bible loaded successfully in ${totalTime}s!`);
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

    const stats = {
        totalVerses: versesResult.count,
        totalChapters: chaptersResult.count,
        booksLoaded: booksResult.count,
    };

    // Log offline readiness status
    console.log('\n📊 STATUS DO BANCO DE DADOS:');
    console.log(`📖 Livros: ${stats.booksLoaded} / 66`);
    console.log(`📄 Capítulos: ${stats.totalChapters} / 1,189`);
    console.log(`✍️ Versículos: ${stats.totalVerses.toLocaleString('pt-BR')} / 31,102`);

    const percentComplete = ((stats.totalVerses / 31102) * 100).toFixed(1);
    console.log(`📈 Progresso: ${percentComplete}%`);

    if (stats.totalVerses >= 31000) {
        console.log('✅ BÍBLIA COMPLETA - Pronta para uso OFFLINE');
    } else {
        console.log('⚠️ BÍBLIA INCOMPLETA - Funcionamento offline comprometido');
    }

    return stats;
}
