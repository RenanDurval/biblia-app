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

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Book } from '../types'; // Assuming Book type is available
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ReadingScreenProps = StackScreenProps<RootStackParamList, 'Reading'>;

export default function ReadingScreen({ route, navigation }: ReadingScreenProps) {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const bookId = route.params?.bookId || 1;
    const initialVerseNumber = route.params?.verseNumber; // Get verse number from navigation
    const [chapterNumber, setChapterNumber] = useState(route.params?.chapterNumber || 1);
    const [versionId, setVersionId] = useState('acf');
    const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
    const [verseBookmarked, setVerseBookmarked] = useState(false);
    const [book, setBook] = useState<Book | null>(null);

    const theme = createTheme(colorScheme === 'dark');

    // Load book data for chapter validation
    useEffect(() => {
        const loadBook = async () => {
            const { getBook } = await import('../services/bibleService');
            const bookData = await getBook(bookId);
            setBook(bookData);
        };
        loadBook();
    }, [bookId]);

    // Auto-select verse when navigating from bookmarks
    useEffect(() => {
        if (initialVerseNumber) {
            const selectVerse = async () => {
                const { getVerse } = await import('../services/bibleService');
                const verse = await getVerse(bookId, chapterNumber, initialVerseNumber, versionId);
                if (verse) {
                    setSelectedVerse(verse);
                }
            };
            selectVerse();
        }
    }, [initialVerseNumber, bookId, chapterNumber, versionId]);

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

    const goToPreviousChapter = async () => {
        if (chapterNumber > 1) {
            // Navigate to previous chapter in same book
            setChapterNumber(chapterNumber - 1);
        } else if (bookId > 1) {
            // At chapter 1, go to last chapter of previous book
            const { getBook } = await import('../services/bibleService');
            const previousBook = await getBook(bookId - 1);
            if (previousBook) {
                navigation.navigate('Reading', {
                    bookId: bookId - 1,
                    chapterNumber: previousBook.chapters,
                });
            }
        }
    };

    const goToNextChapter = async () => {
        console.log('📖 Next button pressed. Current:', { bookId, chapterNumber, bookChapters: book?.chapters });

        if (book && chapterNumber < book.chapters) {
            // Navigate to next chapter in same book
            console.log('✅ Going to next chapter in same book');
            setChapterNumber(chapterNumber + 1);
        } else if (book && chapterNumber === book.chapters && bookId < 66) {
            // At last chapter, go to first chapter of next book
            console.log('✅ Going to next book');
            navigation.navigate('Reading', {
                bookId: bookId + 1,
                chapterNumber: 1,
            });
        } else {
            console.log('⚠️ Cannot navigate: book data not loaded or at end of Bible');
        }
    };

    // Sync chapter number when navigating between books
    useEffect(() => {
        if (route.params?.chapterNumber) {
            setChapterNumber(route.params.chapterNumber);
        }
    }, [route.params?.bookId, route.params?.chapterNumber]);

    const handleGoBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Home');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                            ‹ Voltar
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
                            {book?.name} {chapterNumber}
                        </Text>
                    </View>

                    <View style={styles.actionButton}>
                        {/* Placeholder for future action button if needed */}
                    </View>
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
                <View style={[
                    styles.footer,
                    {
                        backgroundColor: theme.colors.surface,
                        borderTopColor: theme.colors.border,
                        paddingBottom: Math.max(insets.bottom, 12) // Safe area + minimum padding
                    }
                ]}>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        elevation: 2,
        zIndex: 10,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    backButton: {
        padding: 8,
        minWidth: 60,
    },
    actionButton: {
        padding: 8,
        minWidth: 40,
        alignItems: 'flex-end',
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
