// Bible Reader Component with Highlights and Font Size support
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
} from 'react-native';
import { getChapterVerses, getBook } from '../services/bibleService';
import { getChapterHighlights, addHighlight, removeHighlight, HIGHLIGHT_COLORS } from '../services/highlightService';
import { Verse, Book, VerseHighlight } from '../types';
import { createTheme } from '../styles/theme';

interface BibleReaderProps {
    bookId: number;
    chapterNumber: number;
    versionId?: string;
    theme?: 'light' | 'dark';
    fontSize?: number;
    onVersePress?: (verse: Verse) => void;
}

export default function BibleReader({
    bookId,
    chapterNumber,
    versionId = 'acf',
    theme: themeProp = 'light',
    fontSize = 18,
    onVersePress,
}: BibleReaderProps) {
    const [verses, setVerses] = useState<Verse[]>([]);
    const [book, setBook] = useState<Book | null>(null);
    const [highlights, setHighlights] = useState<VerseHighlight[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
    const [highlightMenuVerse, setHighlightMenuVerse] = useState<Verse | null>(null);

    const theme = createTheme(themeProp === 'dark');

    useEffect(() => {
        loadContent();
    }, [bookId, chapterNumber, versionId]);

    const loadContent = async () => {
        try {
            setLoading(true);
            const [versesData, bookData, highlightsData] = await Promise.all([
                getChapterVerses(bookId, chapterNumber, versionId),
                getBook(bookId),
                getChapterHighlights(bookId, chapterNumber),
            ]);
            setVerses(versesData);
            setBook(bookData);
            setHighlights(highlightsData);
        } catch (error) {
            console.error('Error loading Bible content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVersePress = (verse: Verse) => {
        setSelectedVerse(verse.verseNumber);
        onVersePress?.(verse);
    };

    const handleVerseLongPress = (verse: Verse) => {
        setHighlightMenuVerse(verse);
    };

    const handleHighlightColor = async (color: keyof typeof HIGHLIGHT_COLORS) => {
        if (!highlightMenuVerse) return;
        await addHighlight(
            highlightMenuVerse.bookId,
            highlightMenuVerse.chapterNumber,
            highlightMenuVerse.verseNumber,
            color
        );
        const newHighlights = await getChapterHighlights(bookId, chapterNumber);
        setHighlights(newHighlights);
        setHighlightMenuVerse(null);
    };

    const handleRemoveHighlight = async () => {
        if (!highlightMenuVerse) return;
        await removeHighlight(
            highlightMenuVerse.bookId,
            highlightMenuVerse.chapterNumber,
            highlightMenuVerse.verseNumber
        );
        const newHighlights = await getChapterHighlights(bookId, chapterNumber);
        setHighlights(newHighlights);
        setHighlightMenuVerse(null);
    };

    const getVerseHighlight = (verseNumber: number): VerseHighlight | undefined => {
        return highlights.find(h => h.verseNumber === verseNumber);
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <>
            <ScrollView
                style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.contentContainer}
            >
                <View style={styles.header}>
                    <Text style={[styles.bookName, { color: theme.colors.primary }]}>{book?.name}</Text>
                    <Text style={[styles.chapterNumber, { color: theme.colors.textSecondary }]}>Capítulo {chapterNumber}</Text>
                </View>

                <View style={styles.versesContainer}>
                    {verses.map((verse) => {
                        const highlight = getVerseHighlight(verse.verseNumber);
                        const isSelected = selectedVerse === verse.verseNumber;

                        return (
                            <TouchableOpacity
                                key={verse.id}
                                activeOpacity={0.7}
                                onPress={() => handleVersePress(verse)}
                                onLongPress={() => handleVerseLongPress(verse)}
                                style={[
                                    styles.verseContainer,
                                    highlight && { backgroundColor: HIGHLIGHT_COLORS[highlight.color] + '40', borderRadius: 4 },
                                    isSelected && { backgroundColor: theme.colors.primary + '20', borderRadius: 4 }
                                ]}
                            >
                                <Text style={[styles.verseText, { color: theme.colors.text, fontSize: fontSize }]}>
                                    <Text style={[styles.verseNumber, { color: theme.colors.primary, fontSize: fontSize * 0.7 }]}>
                                        {verse.verseNumber}{' '}
                                    </Text>
                                    {verse.text}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <Modal visible={!!highlightMenuVerse} transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setHighlightMenuVerse(null)}>
                    <View style={[styles.highlightMenu, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.menuTitle, { color: theme.colors.text }]}>Destacar Versículo</Text>
                        <View style={styles.colorRow}>
                            {(Object.keys(HIGHLIGHT_COLORS) as Array<keyof typeof HIGHLIGHT_COLORS>).map((colorKey) => (
                                <TouchableOpacity
                                    key={colorKey}
                                    style={[styles.colorCircle, { backgroundColor: HIGHLIGHT_COLORS[colorKey] }]}
                                    onPress={() => handleHighlightColor(colorKey)}
                                />
                            ))}
                        </View>
                        <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveHighlight}>
                            <Text style={{ color: '#FF4444', fontWeight: 'bold' }}>Remover Destaque</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollView: { flex: 1 },
    contentContainer: { padding: 16 },
    header: { marginBottom: 20, alignItems: 'center' },
    bookName: { fontSize: 24, fontWeight: 'bold' },
    chapterNumber: { fontSize: 16 },
    versesContainer: { gap: 12 },
    verseContainer: { paddingVertical: 4, paddingHorizontal: 6 },
    verseNumber: { fontWeight: 'bold' },
    verseText: { lineHeight: 28 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    highlightMenu: { width: '80%', padding: 20, borderRadius: 15, alignItems: 'center' },
    menuTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    colorRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
    colorCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#DDD' },
    removeBtn: { padding: 10 },
});
