// Core Types for Biblical App

export interface BibleVersion {
    id: string;
    name: string;
    abbreviation: string;
    language: string;
    description: string;
}

export interface Book {
    id: number;
    name: string;
    testament: 'OT' | 'NT' | 'APOCRYPHA' | 'QURAN' | 'TORAH';
    chapters: number;
    abbreviation: string;
}

export interface Chapter {
    bookId: number;
    chapterNumber: number;
    verses: Verse[];
}

export interface Verse {
    id: number;
    bookId: number;
    chapterNumber: number;
    verseNumber: number;
    text: string;
    versionId: string;
}

export interface DailyVerse {
    id: string;
    verse: Verse;
    book: Book;
    date: string;
    imageUri?: string;
}

export interface Bookmark {
    id: string;
    bookId: number;
    chapterNumber: number;
    verseNumber: number;
    note?: string;
    createdAt: string;
}

export interface ReadingHistory {
    id: string;
    bookId: number;
    chapterNumber: number;
    timestamp: string;
}

export interface UserSettings {
    preferredVersion: string;
    preferredLanguage: string;
    fontSize: number;
    theme: 'light' | 'dark' | 'auto';
    notificationsEnabled: boolean;
    notificationTime: string;
}

export interface TalmudTractate {
    id: number;
    name: string;
    nameHebrew: string;
    order: string; // Seder (order/section)
    pages: number;
}

export interface TalmudPage {
    id: number;
    tractateId: number;
    pageNumber: string; // e.g., "2a", "2b"
    text: string;
}

export interface VerseHighlight {
    id: string;
    bookId: number;
    chapterNumber: number;
    verseNumber: number;
    color: 'yellow' | 'green' | 'blue' | 'pink' | 'orange';
    createdAt: string;
}
