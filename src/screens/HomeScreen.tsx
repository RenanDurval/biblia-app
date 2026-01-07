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
} from 'react-native';
import { createTheme } from '../styles/theme';
import DailyVerseCard from '../components/DailyVerseCard';
import { initDatabase } from '../database/init';
import { requestNotificationPermissions, scheduleDailyVerseNotification } from '../services/notificationService';

interface HomeScreenProps {
    navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const colorScheme = useColorScheme();
    const [dbInitialized, setDbInitialized] = useState(false);
    const theme = createTheme(colorScheme === 'dark');

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            // Initialize database
            await initDatabase();
            setDbInitialized(true);

            // Request notification permissions
            const hasPermission = await requestNotificationPermissions();
            if (hasPermission) {
                await scheduleDailyVerseNotification(8, 0);
            }
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    };

    if (!dbInitialized) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    Carregando Bíblia Sagrada...
                </Text>
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
        </SafeAreaView>
    );
}

// Quick Access Button Component
function QuickAccessButton({ icon, title, subtitle, onPress, theme }: any) {
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
function FeatureButton({ icon, title, onPress, theme }: any) {
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
});
