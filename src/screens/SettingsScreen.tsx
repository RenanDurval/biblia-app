// Settings Screen - Configure app preferences
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Switch,
    StyleSheet,
    useColorScheme,
    SafeAreaView,
    Alert,
} from 'react-native';
import { getDatabase } from '../database/init';
import { scheduleDailyVerseNotification, cancelAllNotifications, sendTestNotification } from '../services/notificationService';
import { createTheme } from '../styles/theme';

interface SettingsScreenProps {
    navigation: any;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
    const colorScheme = useColorScheme();
    const [settings, setSettings] = useState({
        preferredVersion: 'acf',
        fontSize: 16,
        theme: 'auto',
        notificationsEnabled: true,
        notificationTime: '08:00',
    });

    const theme = createTheme(colorScheme === 'dark');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const db = getDatabase();
            const result: any = await db.getFirstAsync('SELECT * FROM user_settings WHERE id = 1');

            if (result) {
                setSettings({
                    preferredVersion: result.preferred_version,
                    fontSize: result.font_size,
                    theme: result.theme,
                    notificationsEnabled: result.notifications_enabled === 1,
                    notificationTime: result.notification_time,
                });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveSettings = async (newSettings: typeof settings) => {
        try {
            const db = getDatabase();
            await db.runAsync(
                `UPDATE user_settings SET 
          preferred_version = ?,
          font_size = ?,
          theme = ?,
          notifications_enabled = ?,
          notification_time = ?
        WHERE id = 1`,
                newSettings.preferredVersion,
                newSettings.fontSize,
                newSettings.theme,
                newSettings.notificationsEnabled ? 1 : 0,
                newSettings.notificationTime
            );

            setSettings(newSettings);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const toggleNotifications = async (enabled: boolean) => {
        const newSettings = { ...settings, notificationsEnabled: enabled };
        await saveSettings(newSettings);

        if (enabled) {
            const [hour, minute] = settings.notificationTime.split(':').map(Number);
            await scheduleDailyVerseNotification(hour, minute);
        } else {
            await cancelAllNotifications();
        }
    };

    const testNotification = async () => {
        await sendTestNotification();
        Alert.alert('✅ Sucesso', 'Notificação de teste enviada! Aguarde alguns segundos.');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                            ‹ Voltar
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        ⚙️ Configurações
                    </Text>
                </View>

                {/* Version Selection */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Versão da Bíblia
                    </Text>

                    <TouchableOpacity
                        style={[styles.option, { backgroundColor: theme.colors.surface }]}
                        onPress={() => saveSettings({ ...settings, preferredVersion: 'acf' })}
                    >
                        <Text style={[styles.optionText, { color: theme.colors.text }]}>
                            ACF - Almeida Corrigida Fiel
                        </Text>
                        {settings.preferredVersion === 'acf' && (
                            <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.option, { backgroundColor: theme.colors.surface }]}
                        onPress={() => saveSettings({ ...settings, preferredVersion: 'nvi' })}
                    >
                        <Text style={[styles.optionText, { color: theme.colors.text }]}>
                            NVI - Nova Versão Internacional
                        </Text>
                        {settings.preferredVersion === 'nvi' && (
                            <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.option, { backgroundColor: theme.colors.surface }]}
                        onPress={() => saveSettings({ ...settings, preferredVersion: 'kjv' })}
                    >
                        <Text style={[styles.optionText, { color: theme.colors.text }]}>
                            KJV - King James Version (EN)
                        </Text>
                        {settings.preferredVersion === 'kjv' && (
                            <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Notifications */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Notificações
                    </Text>

                    <View style={[styles.option, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.optionText, { color: theme.colors.text }]}>
                            Versículo Diário
                        </Text>
                        <Switch
                            value={settings.notificationsEnabled}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: '#767577', true: theme.colors.primary + '80' }}
                            thumbColor={settings.notificationsEnabled ? theme.colors.primary : '#f4f3f4'}
                        />
                    </View>

                    {settings.notificationsEnabled && (
                        <TouchableOpacity
                            style={[styles.testButton, { backgroundColor: theme.colors.primary }]}
                            onPress={testNotification}
                        >
                            <Text style={styles.testButtonText}>
                                Testar Notificação
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Backup & Restore */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Backup & Restauração
                    </Text>

                    <TouchableOpacity
                        style={[styles.backupButton, { backgroundColor: theme.colors.primary }]}
                        onPress={async () => {
                            const { exportBackup, getBackupStats } = await import('../services/backupService');
                            const stats = await getBackupStats();

                            Alert.alert(
                                '📤 Exportar Backup',
                                `Serão exportados:\n• ${stats.bookmarks} favoritos\n• ${stats.highlights} destaques\n• ${stats.historyEntries} leituras\n\nDeseja continuar?`,
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Exportar',
                                        onPress: async () => {
                                            const success = await exportBackup();
                                            if (success) {
                                                Alert.alert('✅ Sucesso', 'Backup exportado! Salve o arquivo em um local seguro.');
                                            } else {
                                                Alert.alert('❌ Erro', 'Não foi possível exportar o backup.');
                                            }
                                        }
                                    }
                                ]
                            );
                        }}
                    >
                        <Text style={styles.backupButtonText}>
                            📤 Exportar Backup
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.backupButton, { backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.primary }]}
                        onPress={async () => {
                            Alert.alert(
                                '📥 Importar Backup',
                                'Isso irá ADICIONAR os dados do backup aos seus dados atuais. Deseja continuar?',
                                [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                        text: 'Importar',
                                        onPress: async () => {
                                            const { importBackup } = await import('../services/backupService');
                                            const result = await importBackup();

                                            if (result.success) {
                                                Alert.alert('✅ Sucesso', result.message);
                                            } else {
                                                Alert.alert('❌ Erro', result.message);
                                            }
                                        }
                                    }
                                ]
                            );
                        }}
                    >
                        <Text style={[styles.backupButtonText, { color: theme.colors.primary }]}>
                            📥 Importar Backup
                        </Text>
                    </TouchableOpacity>

                    <Text style={[styles.backupHint, { color: theme.colors.textSecondary }]}>
                        💡 Salve o arquivo de backup no Google Drive, WhatsApp ou Email para não perder seus dados!
                    </Text>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        Sobre
                    </Text>

                    <View style={[styles.aboutBox, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.aboutTitle, { color: theme.colors.primary }]}>
                            ✝ Bíblia Sagrada
                        </Text>
                        <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
                            Versão 1.0.0
                        </Text>
                        <Text style={[styles.aboutText, { color: theme.colors.textSecondary, marginTop: 12 }]}>
                            Leia e estude a Palavra de Deus offline{'\n'}
                            com acesso a múltiplas versões, Torah,{'\n'}
                            Alcorão e Livros Apócrifos.
                        </Text>
                    </View>
                </View>
            </ScrollView>
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
    section: {
        padding: 16,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    option: {
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
    optionText: {
        fontSize: 16,
    },
    checkmark: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    testButton: {
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    testButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    aboutBox: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    aboutTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    aboutText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    backupButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backupButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    backupHint: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
        lineHeight: 18,
    },
});
