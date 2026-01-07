// Reading Plan Service
import { getDatabase } from '../database/init';

export interface ReadingPlan {
    id: number;
    name: string;
    description: string;
    duration_days: number;
}

export interface ReadingPlanDay {
    id: number;
    plan_id: number;
    day_number: number;
    readings: string; // JSON
    completed: number;
    completed_at?: string;
}

export interface UserReadingProgress {
    id: number;
    plan_id: number;
    current_day: number;
    started_at: string;
    last_read_at?: string;
}

/**
 * Get all reading plans
 */
export async function getAllReadingPlans(): Promise<ReadingPlan[]> {
    const db = getDatabase();
    const plans = await db.getAllAsync('SELECT * FROM reading_plans');
    return plans as ReadingPlan[];
}

/**
 * Get user's current reading progress
 */
export async function getUserProgress(planId: number): Promise<UserReadingProgress | null> {
    const db = getDatabase();
    const progress = await db.getFirstAsync(
        'SELECT * FROM user_reading_progress WHERE plan_id = ?',
        planId
    );
    return progress as UserReadingProgress | null;
}

/**
 * Start a reading plan
 */
export async function startReadingPlan(planId: number): Promise<void> {
    const db = getDatabase();

    // Check if already started
    const existing = await getUserProgress(planId);
    if (existing) {
        return; // Already started
    }

    await db.runAsync(
        `INSERT INTO user_reading_progress (plan_id, current_day, started_at)
     VALUES (?, 1, CURRENT_TIMESTAMP)`,
        planId
    );
}

/**
 * Get reading for specific day
 */
export async function getReadingForDay(plano: number, day: number): Promise<ReadingPlanDay | null> {
    const db = getDatabase();
    const reading = await db.getFirstAsync(
        'SELECT * FROM reading_plan_days WHERE plan_id = ? AND day_number = ?',
        planId,
        day
    );
    return reading as ReadingPlanDay | null;
}

/**
 * Mark day as completed
 */
export async function markDayCompleted(planId: number, day: number): Promise<void> {
    const db = getDatabase();

    // Mark day as completed
    await db.runAsync(
        `UPDATE reading_plan_days 
     SET completed = 1, completed_at = CURRENT_TIMESTAMP 
     WHERE plan_id = ? AND day_number = ?`,
        planId,
        day
    );

    // Update user progress
    await db.runAsync(
        `UPDATE user_reading_progress 
     SET current_day = ?, last_read_at = CURRENT_TIMESTAMP 
     WHERE plan_id = ?`,
        day + 1,
        planId
    );
}

/**
 * Get completion statistics
 */
export async function getCompletionStats(planId: number): Promise<{
    totalDays: number;
    completedDays: number;
    percentage: number;
}> {
    const db = getDatabase();

    const total = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM reading_plan_days WHERE plan_id = ?',
        planId
    ) as { count: number };

    const completed = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM reading_plan_days WHERE plan_id = ? AND completed = 1',
        planId
    ) as { count: number };

    return {
        totalDays: total.count,
        completedDays: completed.count,
        percentage: total.count > 0 ? Math.round((completed.count / total.count) * 100) : 0,
    };
}

/**
 * Initialize chronological reading plan (call once)
 */
export async function initializeChronologicalPlan(): Promise<void> {
    const db = getDatabase();

    // Check if plan already exists
    const existing = await db.getFirstAsync(
        'SELECT * FROM reading_plans WHERE id = 1'
    );

    if (existing) {
        return; // Already initialized
    }

    // Insert plan
    await db.runAsync(
        `INSERT INTO reading_plans (id, name, description, duration_days)
     VALUES (1, 'Leitura Cronológica em 1 Ano', 'Leia a Bíblia em ordem cronológica dos acontecimentos em 365 dias', 365)`
    );

    // TODO: Insert all 365 days from readingPlanData.ts
    // This will be populated manually or via script
    console.log('Chronological reading plan initialized');
}
