// Daily Verse Card Component
// Displays the daily verse with share functionality

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Share,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getRandomVerse, getBook } from '../services/bibleService';
import { Verse, Book } from '../types';
import { createTheme } from '../styles/theme';

interface DailyVerseCardProps {
    theme?: 'light' | 'dark';
    onPress?: () => void;
}

export default function DailyVerseCard({
    theme: themeProp = 'light',
    onPress
}: DailyVerseCardProps) {
    const [verse, setVerse] = useState<Verse | null>(null);
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);

    const theme = createTheme(themeProp === 'dark');

    useEffect(() => {
        loadDailyVerse();
    }, []);

    const loadDailyVerse = async () => {
        try {
            setLoading(true);
            const dailyVerse = await getRandomVerse();

            if (dailyVerse) {
                setVerse(dailyVerse);
                const bookData = await getBook(dailyVerse.bookId);
                setBook(bookData);
            }
        } catch (error) {
            console.error('Error loading daily verse:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!verse || !book) return;

        const reference = `${book.name} ${verse.chapterNumber}:${verse.verseNumber}`;
        const message = `"${verse.text}"\n\n- ${reference}`;

        try {
            await Share.share({
                message,
                title: 'Versículo do Dia',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
                <ActivityIndicator color={theme.colors.primary} />
            </View>
        );
    }

    if (!verse || !book) {
        return null;
    }

    const reference = `${book.name} ${verse.chapterNumber}:${verse.verseNumber}`;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={styles.touchable}
        >
            <LinearGradient
                colors={
                    themeProp === 'dark'
                        ? ['#3D3428', '#2C2416']
                        : ['#D4AF37', '#8B6914']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <Text style={styles.label}>📖 Versículo do Dia</Text>

                    <Text style={styles.verseText} numberOfLines={4}>
                        "{verse.text}"
                    </Text>

                    <Text style={styles.reference}>{reference}</Text>

                    <TouchableOpacity
                        onPress={handleShare}
                        style={styles.shareButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text style={styles.shareButtonText}>Compartilhar ✨</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    touchable: {
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    gradient: {
        padding: 20,
        minHeight: 200,
    },
    container: {
        borderRadius: 16,
        padding: 20,
        minHeight: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
        opacity: 0.9,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    verseText: {
        fontSize: 18,
        lineHeight: 28,
        color: '#FFF',
        fontStyle: 'italic',
    },
    reference: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
        opacity: 0.8,
        marginTop: 8,
    },
    shareButton: {
        marginTop: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    shareButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
