// Hymns Screen - Harpa Cristã
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
    ActivityIndicator,
} from 'react-native';
import { createTheme } from '../styles/theme';
import { getAllHymns, searchHymns, getHymnCount, Hymn } from '../services/hymnService';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type HymnsScreenProps = StackScreenProps<RootStackParamList, 'Hymns'>;

export default function HymnsScreen({ navigation }: HymnsScreenProps) {
    const colorScheme = useColorScheme();
    const [hymns, setHymns] = useState<Hymn[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [hymnCount, setHymnCount] = useState(0);

    const theme = createTheme(colorScheme === 'dark');

    useEffect(() => {
        loadHymns();
    }, []);

    const loadHymns = async () => {
        try {
            setLoading(true);
            const count = await getHymnCount();
            setHymnCount(count);

            if (count === 0) {
                // No hymns loaded yet
                setHymns([]);
            } else {
                const allHymns = await getAllHymns();
                setHymns(allHymns);
            }
        } catch (error) {
            console.error('Error loading hymns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.trim() === '') {
            loadHymns();
            return;
        }

        try {
            const results = await searchHymns(query);
            setHymns(results);
        } catch (error) {
            console.error('Error searching hymns:', error);
        }
    };

    const renderHymn = ({ item }: { item: Hymn }) => (
        <TouchableOpacity
            style={[styles.hymnCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('HymnViewer', { hymn: item })}
            activeOpacity={0.7}
        >
            <View style={styles.hymnNumber}>
                <Text style={[styles.numberText, { color: theme.colors.primary }]}>
                    {item.number}
                </Text>
            </View>
            <View style={styles.hymnInfo}>
                <Text style={[styles.hymnTitle, { color: theme.colors.text }]} numberOfLines={2}>
                    {item.title}
                </Text>
                {item.category && (
                    <Text style={[styles.hymnCategory, { color: theme.colors.textSecondary }]}>
                        {item.category}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                    Carregando hinário...
                </Text>
            </View>
        );
    }

    if (hymnCount === 0) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                            ‹ Voltar
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        🎵 Harpa Cristã
                    </Text>
                </View>

                <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                        📖 Hinário ainda não carregado
                    </Text>
                    <Text style={[styles.emptyHint, { color: theme.colors.textSecondary }]}>
                        Os 640 hinos da Harpa Cristã serão{'\n'}
                        adicionados em breve!
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                        ‹ Voltar
                    </Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    🎵 Harpa Cristã
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                    {hymnCount} hinos disponíveis
                </Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.searchInput, {
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                    }]}
                    placeholder="Buscar por título ou número..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>

            <FlatList
                data={hymns}
                renderItem={renderHymn}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                            Nenhum hino encontrado
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    searchContainer: {
        padding: 16,
        paddingTop: 0,
    },
    searchInput: {
        padding: 12,
        borderRadius: 12,
        fontSize: 16,
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    hymnCard: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    hymnNumber: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(184, 134, 11, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    numberText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    hymnInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    hymnTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    hymnCategory: {
        fontSize: 12,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    empty: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyHint: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});
