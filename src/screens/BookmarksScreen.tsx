// Bookmarks Screen - View and manage favorite verses
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    StyleSheet,
    useColorScheme,
    SafeAreaView,
} from 'react-native';
import { getAllBookmarks, removeBookmark } from '../services/bookmarkService';
import { getBook, getVerse } from '../services/bibleService';
import { Bookmark, Book, Verse } from '../types';
import { createTheme } from '../styles/theme';

interface BookmarksScreenProps {
    navigation: any;
}

export default function BookmarksScreen({ navigation }: BookmarksScreenProps) {
    const colorScheme = useColorScheme();
    const [bookmarks, setBookmarks] = useState<Array<Bookmark & { book?: Book; verse?: Verse }>>([]);
    const [loading, setLoading] = useState(true);

    const theme = createTheme(colorScheme === 'dark');

    useEffect(() => {
        loadBookmarks();
    }, []);

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            const bookmarksData = await getAllBookmarks();

            // Load book and verse for each bookmark
            const enrichedBookmarks = await Promise.all(
                bookmarksData.map(async (bookmark) => {
                    const book = await getBook(bookmark.bookId);
                    const verse = await getVerse(
                        bookmark.bookId,
                        bookmark.chapterNumber,
                        bookmark.verseNumber
                    );
                    return { ...bookmark, book: book || undefined, verse: verse || undefined };
                })
            );

            setBookmarks(enrichedBookmarks);
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = (bookmark: Bookmark) => {
        Alert.alert(
            'Remover Favorito',
            'Deseja remover este versículo dos favoritos?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        await removeBookmark(bookmark.id);
                        loadBookmarks();
                    },
                },
            ]
        );
    };

    const renderBookmark = ({ item }: { item: Bookmark & { book?: Book; verse?: Verse } }) => (
        <TouchableOpacity
            style={[styles.bookmarkItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('Reading', {
                bookId: item.bookId,
                chapterNumber: item.chapterNumber,
            })}
            activeOpacity={0.7}
        >
            <View style={styles.bookmarkContent}>
                <Text style={[styles.reference, { color: theme.colors.primary }]}>
                    {item.book?.name} {item.chapterNumber}:{item.verseNumber}
                </Text>

                {item.verse && (
                    <Text style={[styles.verseText, { color: theme.colors.text }]} numberOfLines={3}>
                        {item.verse.text}
                    </Text>
                )}

                {item.note && (
                    <Text style={[styles.note, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                        📝 {item.note}
                    </Text>
                )}

                <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </Text>
            </View>

            <TouchableOpacity
                onPress={() => handleRemoveBookmark(item)}
                style={styles.deleteButton}
            >
                <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                        Carregando favoritos...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                            ‹ Voltar
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        ⭐ Favoritos
                    </Text>
                    <Text style={[styles.count, { color: theme.colors.textSecondary }]}>
                        {bookmarks.length} {bookmarks.length === 1 ? 'versículo' : 'versículos'}
                    </Text>
                </View>

                {bookmarks.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>⭐</Text>
                        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                            Você ainda não tem favoritos
                        </Text>
                        <Text style={[styles.emptyHint, { color: theme.colors.textSecondary }]}>
                            Toque no ⭐ ao ler um versículo para salvá-lo aqui
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={bookmarks}
                        renderItem={renderBookmark}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E8D7C3',
    },
    backButton: {
        marginBottom: 8,
    },
    backButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    count: {
        fontSize: 14,
    },
    listContainer: {
        padding: 16,
        gap: 12,
    },
    bookmarkItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bookmarkContent: {
        flex: 1,
        gap: 8,
    },
    reference: {
        fontSize: 14,
        fontWeight: '600',
    },
    verseText: {
        fontSize: 16,
        lineHeight: 22,
    },
    note: {
        fontSize: 14,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    date: {
        fontSize: 12,
        marginTop: 4,
    },
    deleteButton: {
        padding: 8,
        justifyContent: 'center',
    },
    deleteIcon: {
        fontSize: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 12,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 18,
        textAlign: 'center',
    },
    emptyHint: {
        fontSize: 14,
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
});
