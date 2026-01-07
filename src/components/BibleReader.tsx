// Bible Reader Component with Highlights Support
// Main component for reading Bible text with responsive design and verse highlighting

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
import { downloadChapter } from '../services/bibleDownloadService';
import { getChapterHighlights, addHighlight, removeHighlight, HIGHLIGHT_COLORS } from '../services/highlightService';
import { Verse, Book, VerseHighlight } from '../types';
import { createTheme } from '../styles/theme';

interface BibleReaderProps {
    bookId: number;
    chapterNumber: number;
    versionId?: string;
    theme?: 'light' | 'dark';
    onVersePress?: (verse: Verse) => void;
}

export default function BibleReader({
    bookId,
    chapterNumber,
    versionId = 'acf',
    theme: themeProp = 'light',
    onVersePress,
}: BibleReaderProps) {
    const [verses, setVerses] = useState<Verse[]>([]);
    const [book, setBook] = useState<Book | null>(null);
    const [highlights, setHighlights] = useState<VerseHighlight[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
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

            // If no verses, try to download from API
            if (versesData.length === 0) {
                setDownloading(true);
                const success = await downloadChapter(bookId, chapterNumber, versionId);
                if (success) {
                    const newVerses = await getChapterVerses(bookId, chapterNumber, versionId);
                    setVerses(newVerses);
                } else {
                    setVerses([]);
                }
                setDownloading(false);
            } else {
                setVerses(versesData);
            }

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

        // Reload highlights
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

        // Reload highlights
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
                <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                    Carregando...
                </Text>
            </View>
        );
    }

    if (downloading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                    📥 Baixando capítulo...
                </Text>
                <Text style={[styles.downloadHint, { color: theme.colors.textSecondary }]}>
                    Isso só acontece na primeira vez
                </Text>
            </View>
        );
    }

    if (verses.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
                    ❌ Conteúdo não disponível
                    {'\n\n'}
                    Conecte-se à internet para baixar este capítulo.
                </Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView
                style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.contentContainer}
            >
                {/* Chapter Header */}
                <View style={styles.header}>
                    <Text style={[styles.bookName, { color: theme.colors.primary }]}>
                        {book?.name}
                    </Text>
                    <Text style={[styles.chapterNumber, { color: theme.colors.textSecondary }]}>
                        Capítulo {chapterNumber}
                    </Text>
                </View>

                {/* Verses */}
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
                                    highlight && {
                                        backgroundColor: HIGHLIGHT_COLORS[highlight.color],
                                        borderRadius: 6,
                                        paddingHorizontal: 8,
                                    },
                                    isSelected && !highlight && {
                                        backgroundColor: theme.colors.primary + '20',
                                        borderLeftColor: theme.colors.primary,
                                        borderLeftWidth: 3,
                                        paddingLeft: theme.spacing.sm,
                                    },
                                ]}
                            >
                                <Text style={[styles.verseNumber, { color: theme.colors.primary }]}>
                                    {verse.verseNumber}
                                </Text>
                                <Text style={[styles.verseText, { color: theme.colors.text }]}>
                                    {verse.text}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Hint */}
                <View style={styles.hintContainer}>
                    <Text style={[styles.hintText, { color: theme.colors.textSecondary }]}>
                        💡 Toque longo em um versículo para destacar
                    </Text>
                </View>
            </ScrollView>

            {/* Highlight Color Menu */}
            <Modal
                visible={!!highlightMenuVerse}
                transparent
                animationType="fade"
                onRequestClose={() => setHighlightMenuVerse(null)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setHighlightMenuVerse(null)}
                >
                    <View style={[styles.highlightMenu, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                            Destacar Versículo
                        </Text>

                        {(Object.keys(HIGHLIGHT_COLORS) as Array<keyof typeof HIGHLIGHT_COLORS>).map((colorKey) => (
                            <TouchableOpacity
                                key={colorKey}
                                style={[styles.colorOption, { backgroundColor: HIGHLIGHT_COLORS[colorKey] }]}
                                onPress={() => handleHighlightColor(colorKey)}
                            >
                                <Text style={styles.colorLabel}>
                                    {colorKey === 'yellow' && '🟡 Amarelo'}
                                    {colorKey === 'green' && '🟢 Verde'}
                                    {colorKey === 'blue' && '🔵 Azul'}
                                    {colorKey === 'pink' && '🔴 Rosa'}
                                    {colorKey === 'orange' && '🟠 Laranja'}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={[styles.removeOption, { borderColor: theme.colors.border }]}
                            onPress={handleRemoveHighlight}
                        >
                            <Text style={[styles.removeLabel, { color: theme.colors.textSecondary }]}>
                                ❌ Remover Destaque
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    header: {
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#E8D7C3',
    },
    bookName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    chapterNumber: {
        fontSize: 16,
        fontWeight: '600',
    },
    versesContainer: {
        gap: 12,
    },
    verseContainer: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    verseNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 8,
        minWidth: 24,
        textAlign: 'right',
    },
    verseText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
    },
    hintContainer: {
        marginTop: 32,
        padding: 16,
        alignItems: 'center',
    },
    hintText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    downloadHint: {
        marginTop: 8,
        fontSize: 14,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    highlightMenu: {
        width: 280,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    colorOption: {
        padding: 14,
        borderRadius: 8,
        marginBottom: 8,
    },
    colorLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    removeOption: {
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 8,
    },
    removeLabel: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
