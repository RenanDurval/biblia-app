// Bible Download Service
// Downloads Bible chapters from external API and caches locally

import { insertVerse } from './bibleService';

// Using Bible API - Free and supports ACF (Almeida Corrigida Fiel)
const BIBLE_API_BASE = 'https://bible-api.com';

// Map our book IDs to API book names
const BOOK_API_NAMES: { [key: number]: string } = {
    // Old Testament
    1: 'genesis', 2: 'exodus', 3: 'leviticus', 4: 'numbers', 5: 'deuteronomy',
    6: 'joshua', 7: 'judges', 8: 'ruth', 9: '1samuel', 10: '2samuel',
    11: '1kings', 12: '2kings', 13: '1chronicles', 14: '2chronicles',
    15: 'ezra', 16: 'nehemiah', 17: 'esther', 18: 'job', 19: 'psalms',
    20: 'proverbs', 21: 'ecclesiastes', 22: 'song+of+solomon', 23: 'isaiah',
    24: 'jeremiah', 25: 'lamentations', 26: 'ezekiel', 27: 'daniel',
    28: 'hosea', 29: 'joel', 30: 'amos', 31: 'obadiah', 32: 'jonah',
    33: 'micah', 34: 'nahum', 35: 'habakkuk', 36: 'zephaniah',
    37: 'haggai', 38: 'zechariah', 39: 'malachi',
    // New Testament
    40: 'matthew', 41: 'mark', 42: 'luke', 43: 'john', 44: 'acts',
    45: 'romans', 46: '1corinthians', 47: '2corinthians', 48: 'galatians',
    49: 'ephesians', 50: 'philippians', 51: 'colossians',
    52: '1thessalonians', 53: '2thessalonians', 54: '1timothy',
    55: '2timothy', 56: 'titus', 57: 'philemon', 58: 'hebrews',
    59: 'james', 60: '1peter', 61: '2peter', 62: '1john', 63: '2john',
    64: '3john', 65: 'jude', 66: 'revelation',
};

/**
 * Download a chapter from Bible API
 */
export async function downloadChapter(
    bookId: number,
    chapterNumber: number,
    versionId: string = 'acf'
): Promise<boolean> {
    try {
        const bookName = BOOK_API_NAMES[bookId];
        if (!bookName) {
            console.error('Book ID not supported:', bookId);
            return false;
        }

        // Construct URL - example: https://bible-api.com/john+3?translation=almeida
        const url = `${BIBLE_API_BASE}/${bookName}+${chapterNumber}?translation=almeida`;

        console.log(`📥 Downloading: ${bookName} ${chapterNumber}`);

        const response = await fetch(url);
        if (!response.ok) {
            console.error('API error:', response.status);
            return false;
        }

        const data = await response.json();

        // Parse verses from API response
        if (data.verses && Array.isArray(data.verses)) {
            for (const verse of data.verses) {
                await insertVerse({
                    bookId,
                    chapterNumber,
                    verseNumber: verse.verse,
                    text: verse.text.trim(),
                    versionId,
                });
            }

            console.log(`✅ Downloaded ${data.verses.length} verses from ${bookName} ${chapterNumber}`);
            return true;
        } else {
            console.error('Unexpected API response format');
            return false;
        }
    } catch (error) {
        console.error('Download error:', error);
        return false;
    }
}

/**
 * Download entire book
 */
export async function downloadBook(
    bookId: number,
    totalChapters: number,
    versionId: string = 'acf',
    onProgress?: (current: number, total: number) => void
): Promise<boolean> {
    try {
        for (let chapter = 1; chapter <= totalChapters; chapter++) {
            const success = await downloadChapter(bookId, chapter, versionId);
            if (!success) {
                console.error(`Failed to download chapter ${chapter}`);
                return false;
            }

            if (onProgress) {
                onProgress(chapter, totalChapters);
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`✅ Book ${bookId} downloaded successfully`);
        return true;
    } catch (error) {
        console.error('Book download error:', error);
        return false;
    }
}

/**
 * Check download status
 */
export async function getDownloadStatus(
    bookId: number,
    totalChapters: number
): Promise<{ downloaded: number; total: number; percentage: number }> {
    const { isChapterDownloaded } = await import('./bibleService');

    let downloaded = 0;
    for (let chapter = 1; chapter <= totalChapters; chapter++) {
        const hasChapter = await isChapterDownloaded(bookId, chapter, 'acf');
        if (hasChapter) downloaded++;
    }

    return {
        downloaded,
        total: totalChapters,
        percentage: Math.round((downloaded / totalChapters) * 100),
    };
}
