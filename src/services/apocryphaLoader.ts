// Apocrypha Loader Service
import { getDatabase } from '../database/init';
import apocryphaData from '../data/apocrypha.json';

interface ApocryphaBook {
    abbrev: string;
    name: string;
    chapters: string[][];
}

// Book ID mapping for Apocrypha (starts at 67)
const apocryphaMapping: { [key: string]: number } = {
    'tb': 67,  // Tobias
    'jt': 68,  // Judite
    'sb': 69,  // Sabedoria
    'eclo': 70, // Eclesiástico
    'br': 71,   // Baruque
    '1mc': 72,  // 1 Macabeus
    '2mc': 73,  // 2 Macabeus
};

/**
 * Check if Apocrypha is already loaded
 */
export async function isApocryphaLoaded(): Promise<boolean> {
    const db = getDatabase();
    const result = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM verses WHERE book_id >= 67 AND book_id <= 80'
    ) as { count: number };

    return result.count > 100; // At least 100 verses
}

/**
 * Load Apocrypha books from bundled JSON
 */
export async function loadApocrypha(): Promise<boolean> {
    try {
        console.log('📜 Loading Apocrypha books...');
        const db = getDatabase();

        const books = apocryphaData as ApocryphaBook[];
        console.log(`📄 Found ${books.length} apocrypha books to load`);

        for (const book of books) {
            const bookId = apocryphaMapping[book.abbrev.toLowerCase()];

            if (!bookId) {
                console.warn(`⚠️ Unknown apocrypha book: ${book.abbrev}`);
                continue;
            }

            // Load each chapter's verses
            for (let chapterIdx = 0; chapterIdx < book.chapters.length; chapterIdx++) {
                const chapterNumber = chapterIdx + 1;
                const verses = book.chapters[chapterIdx];

                for (let verseIdx = 0; verseIdx < verses.length; verseIdx++) {
                    const verseNumber = verseIdx + 1;
                    const verseText = verses[verseIdx];

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

            console.log(`✅ Loaded: ${book.name}`);
        }

        console.log(`✅ Successfully loaded ${books.length} apocrypha books`);
        return true;
    } catch (error) {
        console.error('❌ Error loading apocrypha:', error);
        return false;
    }
}

/**
 * Get apocrypha loading stats
 */
export async function getApocryphaStats(): Promise<{ totalVerses: number; booksLoaded: number }> {
    const db = getDatabase();

    const versesResult = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM verses WHERE book_id >= 67 AND book_id <= 80'
    ) as { count: number };

    const booksResult = await db.getFirstAsync(
        'SELECT COUNT(DISTINCT book_id) as count FROM verses WHERE book_id >= 67 AND book_id <= 80'
    ) as { count: number };

    return {
        totalVerses: versesResult.count,
        booksLoaded: booksResult.count
    };
}
