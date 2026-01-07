// Reading Screen - Immersive Bible reading experience
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
    SafeAreaView,
} from 'react-native';
import BibleReader from '../components/BibleReader';
import { createTheme } from '../styles/theme';
import { addBookmark, removeBookmarkByVerse, isBookmarked } from '../services/bookmarkService';
import { addReadingHistory } from '../services/historyService';
import { Verse } from '../types';

interface ReadingScreenProps {
    navigation: any;
    route: any;
}

export default function ReadingScreen({ navigation, route }: ReadingScreenProps) {
    const colorScheme = useColorScheme();
    const [bookId, setBookId] = useState(route.params?.bookId || 1);
    const [chapterNumber, setChapterNumber] = useState(route.params?.chapterNumber || 1);
    const [versionId, setVersionId] = useState('acf');
    const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
    const [verseBookmarked, setVerseBookmarked] = useState(false);

    const theme = createTheme(colorScheme === 'dark');

    // Track reading history
    useEffect(() => {
        addReadingHistory(bookId, chapterNumber);
    }, [bookId, chapterNumber]);

    // Check if selected verse is bookmarked
    useEffect(() => {
        if (selectedVerse) {
            checkBookmarkStatus();
        }
    }, [selectedVerse]);

    const checkBookmarkStatus = async () => {
        if (!selectedVerse) return;
        const isBookmark = await isBookmarked(
            selectedVerse.bookId,
            selectedVerse.chapterNumber,
            selectedVerse.verseNumber
        );
        setVerseBookmarked(isBookmark);
    };

    const handleVerseSelect = (verse: Verse) => {
        setSelectedVerse(verse);
    };

    const toggleBookmark = async () => {
        if (!selectedVerse) return;

        if (verseBookmarked) {
            // Remove bookmark
            await removeBookmarkByVerse(
                selectedVerse.bookId,
                selectedVerse.chapterNumber,
                selectedVerse.verseNumber
            );
            setVerseBookmarked(false);
        } else {
            // Add bookmark
            await addBookmark(
                selectedVerse.bookId,
                selectedVerse.chapterNumber,
                selectedVerse.verseNumber
            );
            setVerseBookmarked(true);
        }
    };

    const goToPreviousChapter = () => {
        if (chapterNumber > 1) {
            setChapterNumber(chapterNumber - 1);
        }
    };

    const goToNextChapter = () => {
        setChapterNumber(chapterNumber + 1);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                            ‹ Voltar
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Bible Reader */}
                <BibleReader
                    bookId={bookId}
                    chapterNumber={chapterNumber}
                    versionId={versionId}
                    theme={colorScheme === 'dark' ? 'dark' : 'light'}
                    onVersePress={handleVerseSelect}
                />

                {/* Floating Bookmark Button */}
                {selectedVerse && (
                    <TouchableOpacity
                        style={[styles.floatingButton, { backgroundColor: theme.colors.primary }]}
                        onPress={toggleBookmark}
                    >
                        <Text style={styles.floatingButtonText}>
                            {verseBookmarked ? '⭐' : '☆'}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Navigation Footer */}
                <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
                    <TouchableOpacity
                        style={[styles.navButton, chapterNumber === 1 && styles.navButtonDisabled]}
                        onPress={goToPreviousChapter}
                        disabled={chapterNumber === 1}
                    >
                        <Text style={[
                            styles.navButtonText,
                            { color: theme.colors.primary },
                            chapterNumber === 1 && { opacity: 0.3 }
                        ]}>
                            ‹ Anterior
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.chapterInfo}>
                        <Text style={[styles.chapterLabel, { color: theme.colors.textSecondary }]}>
                            Capítulo
                        </Text>
                        <Text style={[styles.chapterNumberText, { color: theme.colors.text }]}>
                            {chapterNumber}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={goToNextChapter}
                    >
                        <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>
                            Próximo ›
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        paddingVertical: 4,
    },
    backButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    navButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    navButtonDisabled: {
        opacity: 0.3,
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    chapterInfo: {
        alignItems: 'center',
    },
    chapterLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    chapterNumberText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    floatingButtonText: {
        fontSize: 28,
    },
});
