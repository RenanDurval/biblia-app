// Library Screen - Browse all books with Search
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
    SafeAreaView,
    TextInput,
} from 'react-native';
import { getBooks } from '../services/bibleService';
import { Book } from '../types';
import { createTheme } from '../styles/theme';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type LibraryScreenProps = StackScreenProps<RootStackParamList, 'Library'>;

export default function LibraryScreen({ navigation, route }: LibraryScreenProps) {
    const colorScheme = useColorScheme();
    const [books, setBooks] = useState<Book[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
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
                const [ot, nt] = await Promise.all([
                    getBooks('OT'),
                    getBooks('NT'),
                ]);
                const combined = [...ot, ...nt];
                setBooks(combined);
                setFilteredBooks(combined);
                return;
            } else if (filter === 'apocrypha') {
                testament = 'APOCRYPHA';
            } else if (filter === 'quran') {
                testament = 'QURAN';
            }

            const booksData = await getBooks(testament);
            setBooks(booksData);
            setFilteredBooks(booksData);
        } catch (error) {
            console.error('Error loading books:', error);
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredBooks(books);
        } else {
            const filtered = books.filter(book =>
                book.name.toLowerCase().includes(text.toLowerCase()) ||
                book.abbreviation.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredBooks(filtered);
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
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>‹ Voltar</Text>
                        </TouchableOpacity>
                        <Text style={[styles.count, { color: theme.colors.textSecondary }]}>
                            {filteredBooks.length} {filteredBooks.length === 1 ? 'livro' : 'livros'}
                        </Text>
                    </View>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        {getTitle()}
                    </Text>

                    <TextInput
                        style={[styles.searchInput, {
                            backgroundColor: theme.colors.surface,
                            color: theme.colors.text,
                            borderColor: theme.colors.primary + '40'
                        }]}
                        placeholder="Buscar livro..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                </View>

                <FlatList
                    data={filteredBooks}
                    renderItem={renderBook}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={{ color: theme.colors.textSecondary }}>Nenhum livro encontrado</Text>
                        </View>
                    }
                />
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
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    backButton: {
    },
    backButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    count: {
        fontSize: 14,
    },
    searchInput: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        fontSize: 16,
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
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    }
});
