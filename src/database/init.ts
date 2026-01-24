// Database Initialization Module
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { createTables, insertInitialData } from './schema';
import { bibleBooks } from '../data/bibleStructure';
import { DatabaseInterface } from './databaseAdapter';
import { WebDatabase } from './webDatabase';

let database: DatabaseInterface | null = null; // Use Interface instead of direct type

/**
 * Initialize the database
 * Creates tables and inserts initial data
 */
export async function initDatabase(): Promise<DatabaseInterface> {
    if (database) {
        return database;
    }

    try {
        console.log(`📖 Initializing Biblical Database (${Platform.OS})...`);

        if (Platform.OS === 'web') {
            database = new WebDatabase();
            console.log('🌐 Web environment detected: Using WebMockDatabase');
            // Web Mock doesnt need schema creation/inserts as logic is mocked
            return database;
        }

        // Open/create database (NATIVE)
        // Cast to any to bypass strict type checking if internal types diverge, but interface holds
        const db = await SQLite.openDatabaseAsync('biblia.db');

        // Wrap native db to match interface if needed, or if expo-sqlite matches allow direct.
        // runAsync and getAllAsync are available in newer expo-sqlite versions.
        database = db as unknown as DatabaseInterface;

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
        // Dynamic import to avoid bundling issues if needed
        const { insertSampleVerses } = await import('../data/sampleVerses');
        await insertSampleVerses(db); // Pass native db here if sample verses expects it specific type

        // Insert Extended Content
        const { insertExtendedContent } = await import('../data/extendedBibleContent');
        await insertExtendedContent(db);

        // Load Study Materials (PDFs)
        const { loadMaterials, isMaterialsLoaded } = await import('../services/materialLoader');
        if (!(await isMaterialsLoaded())) {
            await loadMaterials();
        }

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
async function insertBooksData(db: DatabaseInterface): Promise<void> {
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
export function getDatabase(): DatabaseInterface {
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
