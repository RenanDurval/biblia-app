// Home Screen - Main entry point of the app
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
    Modal,
} from 'react-native';
import { createTheme } from '../styles/theme';
import DailyVerseCard from '../components/DailyVerseCard';
import { initDatabase } from '../database/init';
import { requestNotificationPermissions, scheduleDailyVerseNotification } from '../services/notificationService';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;

interface QuickAccessButtonProps {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    theme: any; // Using any for theme to avoid complex type importation for now, but could be typed better
}

interface FeatureButtonProps {
    icon: string;
    title: string;
    onPress: () => void;
    theme: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const colorScheme = useColorScheme();
    const [loading, setLoading] = useState(true);
    const [loadingBible, setLoadingBible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bibleProgress, setBibleProgress] = useState({ current: 0, total: 0, book: '' });
    const theme = createTheme(colorScheme === 'dark');

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            // Initialize database
            await initDatabase();

            // Check if Bible is loaded
            const { isBibleLoaded, loadCompleteBible } = await import('../services/completeBibleLoader');
            const isLoaded = await isBibleLoaded();

            if (!isLoaded) {
                // Show loading modal and download Bible
                setLoadingBible(true);
                await loadCompleteBible((current, total, bookName) => {
                    setBibleProgress({ current, total, book: bookName });
                });
                setLoadingBible(false);
            }

            // Load Apocrypha if not already loaded
            const { isApocryphaLoaded, loadApocrypha } = await import('../services/apocryphaLoader');
            if (!(await isApocryphaLoaded())) {
                console.log('📜 Loading Apocrypha...');
                await loadApocrypha();
            }

            // Load Quran if not already loaded
            const { isQuranLoaded, loadQuran } = await import('../services/quranLoader');
            if (!(await isQuranLoaded())) {
                console.log('☪ Loading Quran...');
                await loadQuran();
            }

            // Load Hymns if not already loaded
            const { areHymnsLoaded, loadHymns } = await import('../services/hymnsLoader');
            if (!(await areHymnsLoaded())) {
                console.log('🎵 Loading Hymns...');
                await loadHymns();
            }

            // Request notification permissions
            const hasPermission = await requestNotificationPermissions();
            if (hasPermission) {
                await scheduleDailyVerseNotification(8, 0);
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            setError('Falha ao inicializar o banco de dados. Por favor, reinicie o app.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.title, { color: theme.colors.text, marginTop: 16 }]}>
                    Inicializando...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, padding: 20 }]}>
                <Text style={[styles.title, { color: theme.colors.error, textAlign: 'center', marginBottom: 16 }]}>
                    Erro
                </Text>
                <Text style={{ color: theme.colors.text, textAlign: 'center' }}>{error}</Text>
                <TouchableOpacity
                    style={{ marginTop: 24, padding: 12, backgroundColor: theme.colors.primary, borderRadius: 8 }}
                    onPress={() => { setError(null); initializeApp(); }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView
                style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.contentContainer}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.appTitle, { color: theme.colors.primary }]}>
                        ✝ Bíblia Sagrada
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                        Leia, estude e compartilhe
                    </Text>
                </View>

                {/* Daily Verse */}
                <DailyVerseCard
                    theme={colorScheme === 'dark' ? 'dark' : 'light'}
                    onPress={() => navigation.navigate('Reading', { bookId: 1, chapterNumber: 1 })}
                />

                {/* Quick Access Buttons */}
                <View style={styles.quickAccess}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Acesso Rápido
                    </Text>

                    <View style={styles.buttonsGrid}>
                        <QuickAccessButton
                            icon="📖"
                            title="Bíblia"
                            subtitle="66 livros"
                            onPress={() => navigation.navigate('Library', { filter: 'bible' })}
                            theme={theme}
                        />
                        <QuickAccessButton
                            icon="📜"
                            title="Torah"
                            subtitle="5 livros"
                            onPress={() => navigation.navigate('Library', { filter: 'torah' })}
                            theme={theme}
                        />
                        <QuickAccessButton
                            icon="☪"
                            title="Alcorão"
                            subtitle="114 suras"
                            onPress={() => navigation.navigate('Library', { filter: 'quran' })}
                            theme={theme}
                        />
                        <QuickAccessButton
                            icon="✨"
                            title="Apócrifos"
                            subtitle="14 livros"
                            onPress={() => navigation.navigate('Library', { filter: 'apocrypha' })}
                            theme={theme}
                        />
                    </View>
                </View>

                {/* Features */}
                <View style={styles.features}>
                    <FeatureButton
                        icon="🎵"
                        title="Harpa Cristã"
                        onPress={() => navigation.navigate('Hymns')}
                        theme={theme}
                    />
                    <FeatureButton
                        icon="📅"
                        title="Planos de Leitura"
                        onPress={() => navigation.navigate('ReadingPlans')}
                        theme={theme}
                    />
                    <FeatureButton
                        icon="📚"
                        title="Materiais de Estudo"
                        onPress={() => navigation.navigate('Materials')}
                        theme={theme}
                    />
                    <FeatureButton
                        icon="📊"
                        title="Progresso"
                        onPress={() => navigation.navigate('Progress')}
                        theme={theme}
                    />
                    <FeatureButton
                        icon="⭐"
                        title="Favoritos"
                        onPress={() => navigation.navigate('Bookmarks')}
                        theme={theme}
                    />
                    <FeatureButton
                        icon="🔍"
                        title="Buscar Versículo"
                        onPress={() => navigation.navigate('Search')}
                        theme={theme}
                    />
                    <FeatureButton
                        icon="⚙️"
                        title="Configurações"
                        onPress={() => navigation.navigate('Settings')}
                        theme={theme}
                    />
                </View>
            </ScrollView>

            {/* Bible Loading Modal */}
            <Modal visible={loadingBible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                            📥 Baixando Bíblia Completa
                        </Text>
                        <Text style={[styles.modalProgress, { color: theme.colors.primary }]}>
                            {bibleProgress.current} / {bibleProgress.total}
                        </Text>
                        <Text style={[styles.modalBook, { color: theme.colors.textSecondary }]}>
                            {bibleProgress.book}
                        </Text>
                        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 16 }} />
                        <Text style={[styles.modalHint, { color: theme.colors.textSecondary }]}>
                            Isso acontece apenas uma vez
                        </Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// Quick Access Button Component
function QuickAccessButton({ icon, title, subtitle, onPress, theme }: QuickAccessButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.quickButton, { backgroundColor: theme.colors.surface }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.quickButtonIcon}>{icon}</Text>
            <Text style={[styles.quickButtonTitle, { color: theme.colors.text }]}>
                {title}
            </Text>
            <Text style={[styles.quickButtonSubtitle, { color: theme.colors.textSecondary }]}>
                {subtitle}
            </Text>
        </TouchableOpacity>
    );
}

// Feature Button Component
function FeatureButton({ icon, title, onPress, theme }: FeatureButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.featureButton, { backgroundColor: theme.colors.surface }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.featureIcon}>{icon}</Text>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 32,
    },
    header: {
        padding: 20,
        paddingTop: 8,
    },
    appTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    quickAccess: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    buttonsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickButton: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickButtonIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    quickButtonTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    quickButtonSubtitle: {
        fontSize: 12,
    },
    features: {
        padding: 16,
        gap: 12,
    },
    featureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    featureIcon: {
        fontSize: 24,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalProgress: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalBook: {
        fontSize: 14,
        marginBottom: 8,
    },
    modalHint: {
        fontSize: 12,
        marginTop: 16,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});
