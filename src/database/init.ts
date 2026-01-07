// Database Initialization Module
import * as SQLite from 'expo-sqlite';
import { createTables, insertInitialData } from './schema';
import { bibleBooks } from '../data/bibleStructure';

let database: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database
 * Creates tables and inserts initial data
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (database) {
        return database;
    }

    try {
        // Open/create database
        database = await SQLite.openDatabaseAsync('biblia.db');

        console.log('📖 Initializing Biblical Database...');

        // Create tables
        await database.execAsync(createTables);
        console.log('✅ Tables created successfully');

        // Insert initial data
        await database.execAsync(insertInitialData);
        console.log('✅ Initial data inserted');

        // Insert Bible books structure
        await insertBooksData(database);
        console.log('✅ Bible books structure loaded');

        // Insert sample verses for testing
        const { insertSampleVerses } = await import('../data/sampleVerses');
        await insertSampleVerses(database);

        // Insert extended Bible content  
        const { insertExtendedContent } = await import('../data/extendedBibleContent');
        await insertExtendedContent(database);

        console.log('🎉 Database initialized successfully!');

        return database;
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
}

/**
 * Insert books data into database
 */
async function insertBooksData(db: SQLite.SQLiteDatabase): Promise<void> {
    const insertBookQuery = `
    INSERT OR IGNORE INTO books (id, name, testament, chapters, abbreviation, book_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    for (const book of bibleBooks) {
        await db.runAsync(
            insertBookQuery,
            book.id,
            book.name,
            book.testament,
            book.chapters,
            book.abbreviation,
            book.order
        );
    }
}

/**
 * Get database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
    if (!database) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return database;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
    if (database) {
        await database.closeAsync();
        database = null;
        console.log('Database connection closed');
    }
}
