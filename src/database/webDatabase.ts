
import { DatabaseInterface } from './databaseAdapter';
import { bibleBooks } from '../data/bibleStructure';

export class WebDatabase implements DatabaseInterface {
    async execAsync(queries: string): Promise<void> {
        console.log('[WebMock] Executing queries:', queries.substring(0, 50) + '...');
        return Promise.resolve();
    }

    async runAsync(query: string, ...params: any[]): Promise<any> {
        console.log('[WebMock] Running query:', query, params);
        return Promise.resolve({ insertId: 0, rowsAffected: 0 });
    }

    async getAllAsync<T>(query: string, ...params: any[]): Promise<T[]> {
        console.log('[WebMock] Getting all:', query, params);

        // Simple mock responses based on query content
        if (query.includes('FROM books')) {
            const isApocrypha = query.includes("testament = 'APOCRYPHA'");

            if (isApocrypha) {
                return bibleBooks.filter(b => b.testament === 'APOCRYPHA') as any;
            }
            return bibleBooks as any;
        }

        if (query.includes('FROM verses')) {
            return [
                {
                    id: 1,
                    book_id: 1,
                    chapter: 1,
                    verse_number: 1,
                    text: 'No princípio criou Deus o céu e a terra.'
                },
                {
                    id: 2,
                    book_id: 1,
                    chapter: 1,
                    verse_number: 2,
                    text: 'A terra, porém, estava sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas.'
                }
            ] as any;
        }

        if (query.includes('FROM study_materials')) {
            return [
                {
                    id: 'mock-material-1',
                    title: 'Material de Exemplo (Web)',
                    page_count: 10,
                    added_at: new Date().toISOString()
                },
                {
                    id: 'mock-material-2',
                    title: 'Outro Material (Web)',
                    page_count: 5,
                    added_at: new Date().toISOString()
                }
            ] as any;
        }

        return [];
    }

    async getFirstAsync<T>(query: string, ...params: any[]): Promise<T | null> {
        console.log('[WebMock] Getting first:', query, params);

        if (query.includes('FROM verses')) {
            return {
                id: 1,
                book_id: 1,
                chapter: 1,
                verse_number: 1,
                text: 'No princípio criou Deus o céu e a terra.'
            } as any;
        }

        if (query.includes('FROM study_materials')) {
            if (query.includes('WHERE id = ?')) {
                return {
                    id: 'mock-material-1',
                    title: 'Material de Exemplo (Web)',
                    content: 'Este é um conteúdo de exemplo para o ambiente web. No emulador Android, você verá os PDFs reais importados.',
                    page_count: 10,
                    added_at: new Date().toISOString()
                } as any;
            }
        }

        return null;
    }

    async closeAsync(): Promise<void> {
        console.log('[WebMock] Closing database');
        return Promise.resolve();
    }
}
