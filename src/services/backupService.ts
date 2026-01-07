// Backup & Restore Service
// Export and import user data (bookmarks, highlights, history)

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getDatabase } from '../database/init';

interface BackupData {
    version: string;
    exportDate: string;
    bookmarks: any[];
    highlights: any[];
    history: any[];
    settings: any;
}

/**
 * Export all user data to JSON file
 */
export async function exportBackup(): Promise<boolean> {
    try {
        const db = getDatabase();

        // Get all user data
        const bookmarks = await db.getAllAsync('SELECT * FROM bookmarks');
        const highlights = await db.getAllAsync('SELECT * FROM verse_highlights');
        const history = await db.getAllAsync('SELECT * FROM reading_history');
        const settings = await db.getFirstAsync('SELECT * FROM user_settings WHERE id = 1');

        const backupData: BackupData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            bookmarks: bookmarks || [],
            highlights: highlights || [],
            history: history || [],
            settings: settings || {},
        };

        // Convert to JSON
        const jsonData = JSON.stringify(backupData, null, 2);

        // Create file
        const fileName = `biblia_backup_${new Date().toISOString().split('T')[0]}.json`;
        const fileUri = FileSystem.documentDirectory + fileName;

        await FileSystem.writeAsStringAsync(fileUri, jsonData);

        // Share file
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: 'Salvar Backup da Bíblia',
            });
        }

        console.log('✅ Backup exported successfully');
        return true;

    } catch (error) {
        console.error('❌ Export error:', error);
        return false;
    }
}

/**
 * Import backup from JSON file
 */
export async function importBackup(): Promise<{ success: boolean; message: string }> {
    try {
        // Pick file
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true,
        });

        if (result.canceled) {
            return { success: false, message: 'Importação cancelada' };
        }

        // Read file
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const backupData: BackupData = JSON.parse(fileContent);

        // Validate backup
        if (!backupData.version || !backupData.exportDate) {
            return { success: false, message: 'Arquivo de backup inválido' };
        }

        const db = getDatabase();

        // Clear existing data (optional - you can prompt user)
        // await db.runAsync('DELETE FROM bookmarks');
        // await db.runAsync('DELETE FROM verse_highlights');
        // await db.runAsync('DELETE FROM reading_history');

        // Import bookmarks
        for (const bookmark of backupData.bookmarks) {
            await db.runAsync(
                `INSERT OR REPLACE INTO bookmarks (id, book_id, chapter_number, verse_number, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
                bookmark.id,
                bookmark.book_id,
                bookmark.chapter_number,
                bookmark.verse_number,
                bookmark.note,
                bookmark.created_at
            );
        }

        // Import highlights
        for (const highlight of backupData.highlights) {
            await db.runAsync(
                `INSERT OR REPLACE INTO verse_highlights (id, book_id, chapter_number, verse_number, color, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
                highlight.id,
                highlight.book_id,
                highlight.chapter_number,
                highlight.verse_number,
                highlight.color,
                highlight.created_at
            );
        }

        // Import history
        for (const entry of backupData.history) {
            await db.runAsync(
                `INSERT OR REPLACE INTO reading_history (id, book_id, chapter_number, read_at)
         VALUES (?, ?, ?, ?)`,
                entry.id,
                entry.book_id,
                entry.chapter_number,
                entry.read_at
            );
        }

        // Import settings
        if (backupData.settings && backupData.settings.id) {
            await db.runAsync(
                `UPDATE user_settings 
         SET preferred_version = ?, notifications_enabled = ?, notification_time = ?
         WHERE id = 1`,
                backupData.settings.preferred_version,
                backupData.settings.notifications_enabled,
                backupData.settings.notification_time
            );
        }

        console.log('✅ Backup imported successfully');
        return {
            success: true,
            message: `Backup restaurado com sucesso!\n${backupData.bookmarks.length} favoritos, ${backupData.highlights.length} destaques, ${backupData.history.length} leituras`
        };

    } catch (error) {
        console.error('❌ Import error:', error);
        return { success: false, message: 'Erro ao importar backup: ' + (error as Error).message };
    }
}

/**
 * Get backup statistics
 */
export async function getBackupStats(): Promise<{
    bookmarks: number;
    highlights: number;
    historyEntries: number;
}> {
    const db = getDatabase();

    const bookmarksResult = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM bookmarks'
    ) as { count: number };

    const highlightsResult = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM verse_highlights'
    ) as { count: number };

    const historyResult = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM reading_history'
    ) as { count: number };

    return {
        bookmarks: bookmarksResult.count,
        highlights: highlightsResult.count,
        historyEntries: historyResult.count,
    };
}
