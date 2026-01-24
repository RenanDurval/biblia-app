import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootStackParamList } from '../types';
import { getMaterialContent } from '../services/materialLoader';

type MaterialViewerScreenRouteProp = RouteProp<RootStackParamList, 'MaterialViewer'>;
type MaterialViewerNavigationProp = StackNavigationProp<RootStackParamList, 'MaterialViewer'>;

export default function MaterialViewerScreen() {
    const route = useRoute<MaterialViewerScreenRouteProp>();
    const navigation = useNavigation<MaterialViewerNavigationProp>();
    const { materialId, title } = route.params;

    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContent();
    }, [materialId]);

    const loadContent = async () => {
        setLoading(true);
        try {
            const material = await getMaterialContent(materialId);
            if (material) {
                setContent(material.content);
            } else {
                setContent('Erro: Material não encontrado.');
            }
        } catch (error) {
            console.error('Error loading content:', error);
            setContent('Erro ao carregar conteúdo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="text-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#D4AF37" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.text}>{content}</Text>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
    },
    actionButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginHorizontal: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 60,
    },
    text: {
        fontSize: 18,
        lineHeight: 28,
        color: '#333',
        fontFamily: 'serif', // Use serif for better reading experience if available
    },
});
