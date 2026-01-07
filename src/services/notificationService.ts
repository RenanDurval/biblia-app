// Notification Service for Daily Verses
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getRandomVerse } from './bibleService';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
        console.log('Must use physical device for notifications');
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get notification permissions');
        return false;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('daily-verse', {
            name: 'Versículo Diário',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#D4AF37',
        });
    }

    return true;
}

/**
 * Schedule daily verse notification
 */
export async function scheduleDailyVerseNotification(hour: number = 8, minute: number = 0): Promise<void> {
    try {
        // Cancel existing notifications
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Schedule new notification
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '📖 Versículo do Dia',
                body: 'Toque para ler sua mensagem diária',
                data: { type: 'daily-verse' },
            },
            trigger: {
                hour,
                minute,
                repeats: true,
            },
        });

        console.log(`✅ Daily notification scheduled for ${hour}:${minute.toString().padStart(2, '0')}`);
    } catch (error) {
        console.error('Error scheduling notification:', error);
    }
}

/**
 * Send immediate test notification
 */
export async function sendTestNotification(): Promise<void> {
    const verse = await getRandomVerse();

    if (verse) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '📖 Versículo do Dia',
                body: verse.text.substring(0, 100) + '...',
                data: {
                    type: 'daily-verse',
                    verseId: verse.id,
                },
            },
            trigger: { seconds: 2 },
        });
    }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications canceled');
}

/**
 * Get scheduled notifications
 */
export async function getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
}
