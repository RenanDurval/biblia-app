// Reading Screen - Immersive Bible reading experience with Audio and Sharing
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
    SafeAreaView,
    Share,
    Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BibleReader from '../components/BibleReader';
import { createTheme } from '../styles/theme';
import { addBookmark, removeBookmarkByVerse, isBookmarked } from '../services/bookmarkService';
import { addReadingHistory } from '../services/historyService';
import { Verse, Book } from '../types';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ReadingScreenProps = StackScreenProps<RootStackParamList, 'Reading'>;

export default function ReadingScreen({ route, navigation }: ReadingScreenProps) {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const bookId = route.params?.bookId || 1;
    const initialVerseNumber = route.params?.verseNumber;
    const [chapterNumber, setChapterNumber] = useState(route.params?.chapterNumber || 1);
    const [fontSize, setFontSize] = useState(18);
    const [versionId, setVersionId] = useState('acf');
    const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
    const [verseBookmarked, setVerseBookmarked] = useState(false);
    const [book, setBook] = useState<Book | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const theme = createTheme(colorScheme === 'dark');

    useEffect(() => {
        const loadBook = async () => {
            const { getBook } = await import('../services/bibleService');
            const bookData = await getBook(bookId);
            setBook(bookData);
        };
        const loadSettings = async () => {
            try {
                const savedSize = await AsyncStorage.getItem('bible_font_size');
                if (savedSize) setFontSize(parseInt(savedSize, 10));
            } catch (e) {
                console.error('Failed to load font size', e);
            }
        };
        loadBook();
        loadSettings();
    }, [bookId]);

    const changeFontSize = (newSize: number) => {
        const size = Math.max(12, Math.min(newSize, 30));
        setFontSize(size);
        AsyncStorage.setItem('bible_font_size', size.toString()).catch(console.error);
    };

    useEffect(() => {
        addReadingHistory(bookId, chapterNumber);
        stopSpeech(); // Stop reading if chapter changes
    }, [bookId, chapterNumber]);

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
            await removeBookmarkByVerse(selectedVerse.bookId, selectedVerse.chapterNumber, selectedVerse.verseNumber);
            setVerseBookmarked(false);
        } else {
            await addBookmark(selectedVerse.bookId, selectedVerse.chapterNumber, selectedVerse.verseNumber);
            setVerseBookmarked(true);
        }
    };

    const handleShare = async () => {
        if (!selectedVerse) return;
        try {
            await Share.share({
                message: `"${selectedVerse.text}" - ${book?.name} ${selectedVerse.chapterNumber}:${selectedVerse.verseNumber}\n\nLido no App Bíblia Sagrada ✝`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const toggleSpeech = async () => {
        if (isSpeaking) {
            stopSpeech();
        } else {
            if (selectedVerse) {
                speakVerse(selectedVerse.text);
            } else {
                // If no verse selected, read whole chapter (simplified for now)
                Alert.alert("Leitura", "Selecione um versículo para começar a ouvir.");
            }
        }
    };

    const speakVerse = (text: string) => {
        setIsSpeaking(true);
        Speech.speak(text, {
            language: 'pt-BR',
            onDone: () => setIsSpeaking(false),
            onStopped: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
        });
    };

    const stopSpeech = () => {
        Speech.stop();
        setIsSpeaking(false);
    };

    const goToPreviousChapter = () => {
        if (chapterNumber > 1) {
            setChapterNumber(chapterNumber - 1);
        } else if (bookId > 1) {
            navigation.replace('Reading', { bookId: bookId - 1, chapterNumber: 1 });
        }
    };

    const goToNextChapter = () => {
        if (book && chapterNumber < book.chapters) {
            setChapterNumber(chapterNumber + 1);
        } else if (bookId < 66) {
            navigation.replace('Reading', { bookId: bookId + 1, chapterNumber: 1 });
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.colors.primary + '20' }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Text style={[styles.headerBtnText, { color: theme.colors.primary }]}>‹</Text>
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                        {book?.name} {chapterNumber}
                    </Text>

                    <View style={styles.headerRight}>
                        <TouchableOpacity onPress={() => changeFontSize(fontSize + 2)} style={styles.headerBtn}>
                            <Text style={[styles.headerBtnText, { color: theme.colors.primary, fontSize: 16 }]}>A+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => changeFontSize(fontSize - 2)} style={styles.headerBtn}>
                            <Text style={[styles.headerBtnText, { color: theme.colors.primary, fontSize: 14 }]}>A-</Text>
                        </TouchableOpacity>
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

                {/* Floating Action Menu */}
                {selectedVerse && (
                    <View style={styles.floatingMenu}>
                        <TouchableOpacity
                            style={[styles.menuBtn, { backgroundColor: theme.colors.primary }]}
                            onPress={toggleBookmark}
                        >
                            <Text style={styles.menuBtnText}>{verseBookmarked ? '⭐' : '☆'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.menuBtn, { backgroundColor: theme.colors.primary }]}
                            onPress={handleShare}
                        >
                            <Text style={styles.menuBtnText}>📤</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.menuBtn, { backgroundColor: isSpeaking ? '#FF4444' : theme.colors.primary }]}
                            onPress={toggleSpeech}
                        >
                            <Text style={styles.menuBtnText}>{isSpeaking ? '⏹' : '🔊'}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Footer Navigation */}
                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: theme.colors.surface }]}>
                    <TouchableOpacity onPress={goToPreviousChapter} style={styles.navBtn}>
                        <Text style={[styles.navBtnText, { color: theme.colors.primary }]}>Anterior</Text>
                    </TouchableOpacity>

                    <Text style={[styles.chapterLabel, { color: theme.colors.textSecondary }]}>Cap. {chapterNumber}</Text>

                    <TouchableOpacity onPress={goToNextChapter} style={styles.navBtn}>
                        <Text style={[styles.navBtnText, { color: theme.colors.primary }]}>Próximo</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    headerBtn: { padding: 8 },
    headerBtnText: { fontSize: 24, fontWeight: 'bold' },
    headerRight: { flexDirection: 'row' },
    floatingMenu: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        gap: 12,
    },
    menuBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    menuBtnText: { fontSize: 22, color: '#FFF' },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#DDD',
    },
    navBtn: { padding: 10 },
    navBtnText: { fontSize: 16, fontWeight: '600' },
    chapterLabel: { fontSize: 14, fontWeight: '500' },
});
