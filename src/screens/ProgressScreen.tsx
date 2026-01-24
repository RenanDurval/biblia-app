// Progress Screen - Reading Progress Tracker
// Shows real percentage of Bible read based on 1,189 chapters

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    useColorScheme,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import { getDetailedStats, getAllBooksProgress } from '../services/progressService';
import { createTheme } from '../styles/theme';

interface ProgressScreenProps {
    navigation: any;
}

export default function ProgressScreen({ navigation }: ProgressScreenProps) {
    const colorScheme = useColorScheme();
    const [stats, setStats] = useState({
        totalProgress: 0,
        chaptersRead: 0,
        booksCompleted: 0,
        readingStreak: 0,
        lastRead: null as string | null,
        otProgress: 0,
        ntProgress: 0,
    });
    const [loading, setLoading] = useState(true);

    const theme = createTheme(colorScheme === 'dark');

    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        try {
            setLoading(true);
            const progressData = await getDetailedStats();
            setStats(progressData);
        } catch (error) {
            console.error('Error loading progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatLastRead = (dateString: string | null) => {
        if (!dateString) return 'Nunca';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                            ‹ Voltar
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        📊 Progresso de Leitura
                    </Text>
                </View>

                {/* Main Progress Circle */}
                <View style={[styles.progressCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.circleContainer}>
                        <View style={[styles.progressCircle, { borderColor: theme.colors.primary }]}>
                            <Text style={[styles.percentageText, { color: theme.colors.primary }]}>
                                {stats.totalProgress.toFixed(1)}%
                            </Text>
                            <Text style={[styles.percentageLabel, { color: theme.colors.textSecondary }]}>
                                da Bíblia
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.chaptersText, { color: theme.colors.text }]}>
                        {stats.chaptersRead} / 1.189 capítulos lidos
                    </Text>
                </View>

                {/* Statistics Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                            {stats.booksCompleted}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Livros Completos
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                            {stats.readingStreak}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Dias Consecutivos
                        </Text>
                    </View>
                </View>

                {/* Testament Progress */}
                <View style={[styles.testamentCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Progresso por Testamento
                    </Text>

                    <View style={styles.testamentItem}>
                        <View style={styles.testamentHeader}>
                            <Text style={[styles.testamentName, { color: theme.colors.text }]}>
                                📖 Antigo Testamento
                            </Text>
                            <Text style={[styles.testamentPercent, { color: theme.colors.primary }]}>
                                {stats.otProgress.toFixed(1)}%
                            </Text>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { backgroundColor: theme.colors.primary, width: `${stats.otProgress}%` }
                                ]}
                            />
                        </View>
                    </View>

                    <View style={styles.testamentItem}>
                        <View style={styles.testamentHeader}>
                            <Text style={[styles.testamentName, { color: theme.colors.text }]}>
                                ✝️ Novo Testamento
                            </Text>
                            <Text style={[styles.testamentPercent, { color: theme.colors.primary }]}>
                                {stats.ntProgress.toFixed(1)}%
                            </Text>
                        </View>
                        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { backgroundColor: theme.colors.primary, width: `${stats.ntProgress}%` }
                                ]}
                            />
                        </View>
                    </View>
                </View>

                {/* Last Read */}
                <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                        Última leitura
                    </Text>
                    <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                        {formatLastRead(stats.lastRead)}
                    </Text>
                </View>

                {/* Motivational Message */}
                <View style={styles.motivationCard}>
                    <Text style={[styles.motivationText, { color: theme.colors.textSecondary }]}>
                        {stats.totalProgress === 0 && '🌟 Comece sua jornada de leitura hoje!'}
                        {stats.totalProgress > 0 && stats.totalProgress < 10 && '📖 Ótimo começo! Continue lendo!'}
                        {stats.totalProgress >= 10 && stats.totalProgress < 50 && '🔥 Você está progredindo bem!'}
                        {stats.totalProgress >= 50 && stats.totalProgress < 100 && '🎯 Mais da metade concluída!'}
                        {stats.totalProgress === 100 && '🎉 Parabéns! Você leu a Bíblia completa!'}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        paddingTop: 8,
    },
    backButton: {
        marginBottom: 8,
    },
    backButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    progressCard: {
        margin: 16,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    circleContainer: {
        marginBottom: 16,
    },
    progressCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    percentageLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    chaptersText: {
        fontSize: 16,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    testamentCard: {
        margin: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    testamentItem: {
        marginBottom: 16,
    },
    testamentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    testamentName: {
        fontSize: 14,
        fontWeight: '600',
    },
    testamentPercent: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    infoCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    infoLabel: {
        fontSize: 14,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    motivationCard: {
        marginHorizontal: 16,
        marginBottom: 24,
        padding: 16,
        alignItems: 'center',
    },
    motivationText: {
        fontSize: 16,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
