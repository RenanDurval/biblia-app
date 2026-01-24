
import * as SQLite from 'expo-sqlite';

export interface DatabaseInterface {
    execAsync(queries: string): Promise<void>;
    runAsync(query: string, ...params: any[]): Promise<SQLite.SQLiteRunResult>;
    getAllAsync<T>(query: string, ...params: any[]): Promise<T[]>;
    getFirstAsync<T>(query: string, ...params: any[]): Promise<T | null>;
    withTransactionAsync<T>(task: () => Promise<T>): Promise<T>;
    closeAsync(): Promise<void>;
}
