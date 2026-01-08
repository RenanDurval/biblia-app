// Library Screen - Browse all books
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
    SafeAreaView,
} from 'react-native';
import { getBooks } from '../services/bibleService';
import { Book } from '../types';
import { createTheme } from '../styles/theme';
// import AdBanner from '../components/AdBanner'; // Temporarily disabled for Expo Go

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type LibraryScreenProps = StackScreenProps<RootStackParamList, 'Library'>;

export default function LibraryScreen({ navigation, route }: LibraryScreenProps) {
    const colorScheme = useColorScheme();
    const [books, setBooks] = useState<Book[]>([]);
    const [filter, setFilter] = useState(route.params?.filter || 'all');
    const theme = createTheme(colorScheme === 'dark');

    useEffect(() => {
        loadBooks();
    }, [filter]);

    const loadBooks = async () => {
        try {
            let testament: 'OT' | 'NT' | 'APOCRYPHA' | 'QURAN' | 'TORAH' | undefined = undefined;

            if (filter === 'torah') {
                testament = 'TORAH';
            } else if (filter === 'bible') {
                // Get both OT and NT
                const [ot, nt] = await Promise.all([
                    getBooks('OT'),
                    getBooks('NT'),
                ]);
                setBooks([...ot, ...nt]);
                return;
            } else if (filter === 'apocrypha') {
                testament = 'APOCRYPHA';
            } else if (filter === 'quran') {
                testament = 'QURAN';
            }

            const booksData = await getBooks(testament);
            setBooks(booksData);
        } catch (error) {
            console.error('Error loading books:', error);
        }
    };

    const renderBook = ({ item }: { item: Book }) => (
        <TouchableOpacity
            style={[styles.bookItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('Reading', { bookId: item.id, chapterNumber: 1 })}
            activeOpacity={0.7}
        >
            <View style={styles.bookInfo}>
                <Text style={[styles.bookName, { color: theme.colors.text }]}>
                    {item.name}
                </Text>
                <Text style={[styles.bookDetails, { color: theme.colors.textSecondary }]}>
                    {item.chapters} {item.chapters === 1 ? 'capítulo' : 'capítulos'}
                </Text>
            </View>
            <Text style={[styles.arrow, { color: theme.colors.primary }]}>›</Text>
        </TouchableOpacity>
    );

    const getTitle = () => {
        switch (filter) {
            case 'torah': return '📜 Torah';
            case 'bible': return '📖 Bíblia';
            case 'apocrypha': return '✨ Apócrifos';
            case 'quran': return '☪ Alcorão';
            default: return '📚 Biblioteca';
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>‹ Voltar</Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        {getTitle()}
                    </Text>
                    <Text style={[styles.count, { color: theme.colors.textSecondary }]}>
                        {books.length} {books.length === 1 ? 'livro' : 'livros'}
                    </Text>
                </View>

                <FlatList
                    data={books}
                    renderItem={renderBook}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                />

                {/* Ad Banner - Temporarily disabled for Expo Go */}
                {/* <AdBanner /> */}
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
    bookItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bookInfo: {
        flex: 1,
    },
    bookName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    bookDetails: {
        fontSize: 14,
    },
    arrow: {
        fontSize: 28,
        fontWeight: '300',
    },
});
