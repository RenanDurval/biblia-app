// Bible Reader Component
// Main component for reading Bible text with responsive design

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { getChapterVerses, getBook } from '../services/bibleService';
import { Verse, Book } from '../types';
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
    const [loading, setLoading] = useState(true);
    const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

    const theme = createTheme(themeProp === 'dark');

    useEffect(() => {
        loadContent();
    }, [bookId, chapterNumber, versionId]);

    const loadContent = async () => {
        try {
            setLoading(true);

            const [versesData, bookData] = await Promise.all([
                getChapterVerses(bookId, chapterNumber, versionId),
                getBook(bookId),
            ]);

            setVerses(versesData);
            setBook(bookData);
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

    if (verses.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
                    Conteúdo não disponível offline.
                    {'\n\n'}
                    Conecte-se à internet para baixar este capítulo.
                </Text>
            </View>
        );
    }

    return (
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
                {verses.map((verse) => (
                    <TouchableOpacity
                        key={verse.id}
                        activeOpacity={0.7}
                        onPress={() => handleVersePress(verse)}
                        style={[
                            styles.verseContainer,
                            selectedVerse === verse.verseNumber && {
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
                ))}
            </View>
        </ScrollView>
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
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});
