// Reading Plans Screen
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
    getAllReadingPlans,
    getUserProgress,
    startReadingPlan,
    getCompletionStats,
    ReadingPlan,
} from '../services/readingPlanService';

interface ReadingPlansScreenProps {
    navigation: any;
}

export default function ReadingPlansScreen({ navigation }: ReadingPlansScreenProps) {
    const colorScheme = useColorScheme();
    const [plans, setPlans] = useState<ReadingPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<{ [key: number]: any }>({});

    const theme = createTheme(colorScheme === 'dark');

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const allPlans = await getAllReadingPlans();
            setPlans(allPlans);

            // Load stats for each plan
            const statsData: { [key: number]: any } = {};
            for (const plan of allPlans) {
                const progress = await getUserProgress(plan.id);
                const completion = await getCompletionStats(plan.id);
                statsData[plan.id] = { progress, completion };
            }
            setStats(statsData);
        } catch (error) {
            console.error('Error loading plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartPlan = async (planId: number) => {
        await startReadingPlan(planId);
        navigation.navigate('ReadingPlanViewer', { planId });
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
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                            ‹ Voltar
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        📅 Planos de Leitura
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Leia a Bíblia de forma organizada
                    </Text>
                </View>

                {plans.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                            📖 Plano de Leitura em Breve!
                        </Text>
                        <Text style={[styles.emptyHint, { color: theme.colors.textSecondary }]}>
                            O plano cronológico de 365 dias será{'\n'}
                            carregado automaticamente
                        </Text>
                    </View>
                ) : (
                    <View style={styles.plansContainer}>
                        {plans.map((plan) => {
                            const planStats = stats[plan.id];
                            const hasStarted = planStats?.progress !== null;
                            const completionPercentage = planStats?.completion?.percentage || 0;

                            return (
                                <View
                                    key={plan.id}
                                    style={[styles.planCard, { backgroundColor: theme.colors.surface }]}
                                >
                                    <Text style={[styles.planName, { color: theme.colors.text }]}>
                                        {plan.name}
                                    </Text>
                                    <Text style={[styles.planDescription, { color: theme.colors.textSecondary }]}>
                                        {plan.description}
                                    </Text>
                                    <Text style={[styles.planDuration, { color: theme.colors.primary }]}>
                                        📆 {plan.duration_days} dias
                                    </Text>

                                    {hasStarted && (
                                        <View style={styles.progressContainer}>
                                            <View style={styles.progressBar}>
                                                <View
                                                    style={[
                                                        styles.progressFill,
                                                        {
                                                            backgroundColor: theme.colors.primary,
                                                            width: `${completionPercentage}%`,
                                                        },
                                                    ]}
                                                />
                                            </View>
                                            <Text style={[styles.progressText, { color: theme.colors.text }]}>
                                                {completionPercentage}% concluído
                                            </Text>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={[styles.button, { backgroundColor: theme.colors.primary }]}
                                        onPress={() =>
                                            hasStarted
                                                ? navigation.navigate('ReadingPlanViewer', { planId: plan.id })
                                                : handleStartPlan(plan.id)
                                        }
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.buttonText}>
                                            {hasStarted ? '📖 Continuar Leitura' : '🚀 Começar Plano'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}
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
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyHint: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    plansContainer: {
        padding: 16,
    },
    planCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    planName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    planDescription: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    planDuration: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'right',
    },
    button: {
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
