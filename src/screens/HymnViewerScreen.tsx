// Hymn Viewer Screen - Display individual hymn
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
    SafeAreaView,
    Share,
} from 'react-native';
import { createTheme } from '../styles/theme';
import { Hymn } from '../services/hymnService';

interface HymnViewerScreenProps {
    navigation: any;
    route: {
        params: {
            hymn: Hymn;
        };
    };
}

export default function HymnViewerScreen({ navigation, route }: HymnViewerScreenProps) {
    const { hymn } = route.params;
    const colorScheme = useColorScheme();
    const theme = createTheme(colorScheme === 'dark');

    const handleShare = async () => {
        try {
            await Share.share({
                message: `🎵 Harpa Cristã - Hino ${hymn.number}\n\n${hymn.title}\n\n${hymn.lyrics}`,
            });
        } catch (error) {
            console.error('Error sharing hymn:', error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                        ‹ Voltar
                    </Text>
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <Text style={[styles.hymnNumber, { color: theme.colors.primary }]}>
                        Hino {hymn.number}
                    </Text>
                    <Text style={[styles.hymnTitle, { color: theme.colors.text }]}>
                        {hymn.title}
                    </Text>
                    {hymn.category && (
                        <Text style={[styles.hymnCategory, { color: theme.colors.textSecondary }]}>
                            {hymn.category}
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.shareButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleShare}
                    activeOpacity={0.7}
                >
                    <Text style={styles.shareButtonText}>🔗 Compartilhar</Text>
                </TouchableOpacity>
            </View>

            {/* Lyrics */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.lyricsContainer}
            >
                <Text style={[styles.lyrics, { color: theme.colors.text }]}>
                    {hymn.lyrics}
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    backButton: {
        marginBottom: 12,
    },
    backButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    headerInfo: {
        marginBottom: 16,
    },
    hymnNumber: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    hymnTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    hymnCategory: {
        fontSize: 12,
    },
    shareButton: {
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    shareButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    lyricsContainer: {
        padding: 20,
    },
    lyrics: {
        fontSize: 16,
        lineHeight: 28,
        letterSpacing: 0.3,
    },
});
