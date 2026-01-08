// Notification Service for Daily Verses
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getRandomVerse } from './bibleService';

// Configure notification handler - wrapped in try-catch to prevent Android errors
try {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
} catch (error) {
    console.warn('⚠️ Could not configure notification handler:', error);
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    try {
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
    } catch (error) {
        console.error('⚠️ Notification permission error:', error);
        return false;
    }
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
                type: 'calendar', // Explicit type
                hour,
                minute,
                repeats: true,
            } as any,
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
    try {
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
                trigger: {
                    type: 'timeInterval', // Explicit type
                    seconds: 2
                } as any,
            });
        }
    } catch (error) {
        console.error('⚠️ Test notification error:', error);
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
