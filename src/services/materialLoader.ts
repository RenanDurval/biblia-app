import { getDatabase } from '../database/init';

interface StudyMaterial {
    id: string;
    title: string;
    content: string;
    pageCount: number;
    info: any;
    addedAt: string;
}

/**
 * Check if study materials are already loaded
 */
export async function isMaterialsLoaded(): Promise<boolean> {
    const db = getDatabase();
    try {
        const result = await db.getFirstAsync(
            'SELECT COUNT(*) as count FROM study_materials'
        ) as { count: number };

        return result.count > 0;
    } catch (e) {
        // Table might not exist yet if schema update didn't run
        return false;
    }
}

/**
 * Load study materials from bundled JSON
 * NOTE: This JSON can be large, so we handle it carefully.
 */
export async function loadMaterials(): Promise<boolean> {
    try {
        console.log('📚 Loading Study Materials...');
        const db = getDatabase();

        // Check if file exists (in a way that works in RN environment via require)
        let materials: StudyMaterial[] = [];
        try {
            // Using require to load the large JSON.
            // This happens synchronously in JS thread.
            materials = require('../data/extra_materials.json');
        } catch (e) {
            console.warn('⚠️ No extra_materials.json found or error loading it.');
            return false;
        }

        console.log(`📄 Found ${materials.length} materials to load`);

        // We use a transaction or just loop. 
        // For 40 items of 70MB total, simplistic loop is fine but we should watch for memory.

        for (const material of materials) {
            await db.runAsync(
                `INSERT OR REPLACE INTO study_materials (id, title, content, page_count, info, added_at)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                material.id,
                material.title,
                material.content,
                material.pageCount,
                JSON.stringify(material.info || {}),
                material.addedAt
            );
            console.log(`✅ Loaded: ${material.title}`);
        }

        console.log(`✅ Successfully loaded ${materials.length} materials`);
        return true;
    } catch (error) {
        console.error('❌ Error loading materials:', error);
        return false;
    }
}

/**
 * Search materials
 */
export async function searchMaterials(query: string): Promise<any[]> {
    const db = getDatabase();
    const search = `%${query}%`;

    return await db.getAllAsync(
        `SELECT id, title, page_count, added_at 
         FROM study_materials 
         WHERE title LIKE ? OR content LIKE ?
         LIMIT 20`,
        search, search
    );
}

/**
 * Get all materials (metadata only)
 */
export async function getAllMaterials(): Promise<any[]> {
    const db = getDatabase();
    return await db.getAllAsync(
        'SELECT id, title, page_count, added_at FROM study_materials ORDER BY title ASC'
    );
}

/**
 * Get specific material content
 */
export async function getMaterialContent(id: string): Promise<any> {
    const db = getDatabase();
    return await db.getFirstAsync(
        'SELECT * FROM study_materials WHERE id = ?',
        id
    );
}
