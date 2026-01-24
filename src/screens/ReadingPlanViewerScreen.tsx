// Reading Plan Viewer Screen
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { createTheme } from '../styles/theme';
import {
    getReadingPlan,
    getReadingPlanDays,
    getUserProgress,
    markDayCompleted,
    ReadingPlan,
    ReadingPlanDay,
} from '../services/readingPlanService';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

// Extend RootStackParamList locally or in types/index.ts
// For now, handling as any or adding to local types
type Props = StackScreenProps<RootStackParamList, 'ReadingPlanViewer'>;

export default function ReadingPlanViewerScreen({ route, navigation }: Props) {
    const colorScheme = useColorScheme();
    const { planId } = route.params;
    const [plan, setPlan] = useState<ReadingPlan | null>(null);
    const [days, setDays] = useState<ReadingPlanDay[]>([]);
    const [loading, setLoading] = useState(true);
    const theme = createTheme(colorScheme === 'dark');

    useEffect(() => {
        loadPlanDetails();
    }, [planId]);

    const loadPlanDetails = async () => {
        try {
            setLoading(true);
            const [planData, daysData] = await Promise.all([
                getReadingPlan(planId),
                getReadingPlanDays(planId)
            ]);
            setPlan(planData);
            setDays(daysData);
        } catch (error) {
            console.error('Error loading plan details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkCompleted = async (dayNumber: number) => {
        await markDayCompleted(planId, dayNumber);
        loadPlanDetails(); // Refresh
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>‹ Voltar</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>{plan?.name}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.list}>
                {days.map((day) => (
                    <View key={day.id} style={[styles.dayCard, { backgroundColor: theme.colors.surface }]}>
                        <View style={styles.dayHeader}>
                            <Text style={[styles.dayTitle, { color: theme.colors.text }]}>Dia {day.day_number}</Text>
                            {day.completed === 1 && <Text style={{ color: theme.colors.success }}>✓ Concluído</Text>}
                        </View>

                        <View style={styles.readings}>
                            {JSON.parse(day.readings).map((read: any, idx: number) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => navigation.navigate('Reading', { bookId: read.book_id, chapterNumber: read.chapter_start })}
                                >
                                    <Text style={[styles.readingText, { color: theme.colors.primary }]}>
                                        📖 Livro {read.book_id} - Cap. {read.chapter_start}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {day.completed === 0 && (
                            <TouchableOpacity
                                style={[styles.completeBtn, { backgroundColor: theme.colors.primary }]}
                                onPress={() => handleMarkCompleted(day.day_number)}
                            >
                                <Text style={styles.completeBtnText}>Marcar como Lido</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { padding: 16 },
    backButton: { marginBottom: 8 },
    backButtonText: { fontSize: 18, fontWeight: 'bold' },
    title: { fontSize: 24, fontWeight: 'bold' },
    list: { padding: 16 },
    dayCard: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    dayTitle: { fontSize: 18, fontWeight: 'bold' },
    readings: { marginBottom: 15 },
    readingText: { fontSize: 16, marginBottom: 5, textDecorationLine: 'underline' },
    completeBtn: { padding: 10, borderRadius: 8, alignItems: 'center' },
    completeBtnText: { color: '#FFF', fontWeight: 'bold' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
