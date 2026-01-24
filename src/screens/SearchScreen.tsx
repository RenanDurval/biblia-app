// Search Screen - Search for verses with filters
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    useColorScheme,
    SafeAreaView,
    Keyboard,
    ScrollView,
} from 'react-native';
import { searchVerses, getBook, getBooks } from '../services/bibleService';
import { Verse, Book } from '../types';
import { createTheme } from '../styles/theme';

interface SearchScreenProps {
    navigation: any;
}

export default function SearchScreen({ navigation }: SearchScreenProps) {
    const colorScheme = useColorScheme();
    const [searchMode, setSearchMode] = useState<'text' | 'reference'>('text');

    // Text search
    const [query, setQuery] = useState('');

    // Reference search
    const [selectedBook, setSelectedBook] = useState<number | null>(null);
    const [chapterNumber, setChapterNumber] = useState('');
    const [verseNumber, setVerseNumber] = useState('');
    const [books, setBooks] = useState<Book[]>([]);
    const [showBookPicker, setShowBookPicker] = useState(false);

    const [results, setResults] = useState<Array<Verse & { book?: Book }>>([]);
    const [loading, setLoading] = useState(false);

    const theme = createTheme(colorScheme === 'dark');

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        const allBooks = await getBooks();
        setBooks(allBooks);
    };

    const handleTextSearch = async () => {
        if (!query.trim()) return;

        Keyboard.dismiss();
        setLoading(true);

        try {
            const verses = await searchVerses(query.trim());

            const versesWithBooks = await Promise.all(
                verses.map(async (verse) => {
                    const book = await getBook(verse.bookId);
                    return { ...verse, book: book || undefined };
                })
            );

            setResults(versesWithBooks);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReferenceSearch = () => {
        if (!selectedBook) {
            alert('Selecione um livro');
            return;
        }

        const chapter = parseInt(chapterNumber) || 1;
        const verse = parseInt(verseNumber) || 1;

        // Navigate directly to the reading screen
        navigation.navigate('Reading', {
            bookId: selectedBook,
            chapterNumber: chapter,
        });
    };

    const renderResult = ({ item }: { item: Verse & { book?: Book } }) => (
        <TouchableOpacity
            style={[styles.resultItem, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('Reading', {
                bookId: item.bookId,
                chapterNumber: item.chapterNumber
            })}
            activeOpacity={0.7}
        >
            <Text style={[styles.reference, { color: theme.colors.primary }]}>
                {item.book?.name} {item.chapterNumber}:{item.verseNumber}
            </Text>
            <Text style={[styles.verseText, { color: theme.colors.text }]} numberOfLines={3}>
                {item.text}
            </Text>
        </TouchableOpacity>
    );

    const selectedBookData = books.find(b => b.id === selectedBook);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                            ‹ Voltar
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        🔍 Buscar
                    </Text>
                </View>

                {/* Mode Selector */}
                <View style={styles.modeSelector}>
                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            { backgroundColor: searchMode === 'text' ? theme.colors.primary : theme.colors.surface }
                        ]}
                        onPress={() => setSearchMode('text')}
                    >
                        <Text style={[
                            styles.modeButtonText,
                            { color: searchMode === 'text' ? '#FFF' : theme.colors.text }
                        ]}>
                            Buscar Texto
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            { backgroundColor: searchMode === 'reference' ? theme.colors.primary : theme.colors.surface }
                        ]}
                        onPress={() => setSearchMode('reference')}
                    >
                        <Text style={[
                            styles.modeButtonText,
                            { color: searchMode === 'reference' ? '#FFF' : theme.colors.text }
                        ]}>
                            Ir para Referência
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Text Search Mode */}
                {searchMode === 'text' && (
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={[styles.searchInput, {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            }]}
                            placeholder="Digite palavras-chave..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={handleTextSearch}
                            returnKeyType="search"
                        />
                        <TouchableOpacity
                            style={[styles.searchButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleTextSearch}
                        >
                            <Text style={styles.searchButtonText}>Buscar</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Reference Search Mode */}
                {searchMode === 'reference' && (
                    <View style={styles.referenceContainer}>
                        {/* Book Selector */}
                        <TouchableOpacity
                            style={[styles.pickerButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                            onPress={() => setShowBookPicker(!showBookPicker)}
                        >
                            <Text style={[styles.pickerButtonText, { color: theme.colors.text }]}>
                                {selectedBookData ? selectedBookData.name : 'Selecione o Livro'}
                            </Text>
                            <Text style={[styles.pickerArrow, { color: theme.colors.primary }]}>▼</Text>
                        </TouchableOpacity>

                        {showBookPicker && (
                            <ScrollView style={[styles.bookPicker, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                                {books.map((book) => (
                                    <TouchableOpacity
                                        key={book.id}
                                        style={styles.bookOption}
                                        onPress={() => {
                                            setSelectedBook(book.id);
                                            setShowBookPicker(false);
                                        }}
                                    >
                                        <Text style={[styles.bookOptionText, { color: theme.colors.text }]}>
                                            {book.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {/* Chapter and Verse */}
                        <View style={styles.numberInputs}>
                            <View style={styles.numberInputContainer}>
                                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Capítulo</Text>
                                <TextInput
                                    style={[styles.numberInput, {
                                        backgroundColor: theme.colors.surface,
                                        color: theme.colors.text,
                                        borderColor: theme.colors.border,
                                    }]}
                                    placeholder="1"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={chapterNumber}
                                    onChangeText={setChapterNumber}
                                    keyboardType="number-pad"
                                />
                            </View>

                            <View style={styles.numberInputContainer}>
                                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>Versículo (opcional)</Text>
                                <TextInput
                                    style={[styles.numberInput, {
                                        backgroundColor: theme.colors.surface,
                                        color: theme.colors.text,
                                        borderColor: theme.colors.border,
                                    }]}
                                    placeholder="1"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={verseNumber}
                                    onChangeText={setVerseNumber}
                                    keyboardType="number-pad"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.goButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleReferenceSearch}
                        >
                            <Text style={styles.goButtonText}>Ir para Passagem</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Results for Text Search */}
                {searchMode === 'text' && (
                    <>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                                    Buscando...
                                </Text>
                            </View>
                        ) : results.length > 0 ? (
                            <>
                                <Text style={[styles.resultCount, { color: theme.colors.textSecondary }]}>
                                    {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                                </Text>
                                <FlatList
                                    data={results}
                                    renderItem={renderResult}
                                    keyExtractor={(item) => item.id.toString()}
                                    contentContainerStyle={styles.listContainer}
                                />
                            </>
                        ) : query ? (
                            <View style={styles.emptyContainer}>
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                    Nenhum resultado encontrado
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                                    Digite uma palavra ou frase para buscar
                                </Text>
                            </View>
                        )}
                    </>
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
    },
    modeSelector: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modeButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    searchButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        justifyContent: 'center',
    },
    searchButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    referenceContainer: {
        paddingHorizontal: 16,
        gap: 12,
    },
    pickerButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    pickerButtonText: {
        fontSize: 16,
    },
    pickerArrow: {
        fontSize: 12,
    },
    bookPicker: {
        maxHeight: 200,
        borderRadius: 12,
        borderWidth: 1,
    },
    bookOption: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    bookOptionText: {
        fontSize: 16,
    },
    numberInputs: {
        flexDirection: 'row',
        gap: 12,
    },
    numberInputContainer: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    numberInput: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
        textAlign: 'center',
    },
    goButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    goButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    resultCount: {
        paddingHorizontal: 16,
        marginBottom: 8,
        fontSize: 14,
    },
    listContainer: {
        padding: 16,
        gap: 12,
    },
    resultItem: {
        padding: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reference: {
        fontSize: 14,
        fontWeight: '600',
    },
    verseText: {
        fontSize: 16,
        lineHeight: 22,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
