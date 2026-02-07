import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    return finalStatus === 'granted';
};

export const scheduleTimerNotification = async (expiryTimestamp: number): Promise<string> => {
    if (Platform.OS === 'web') return '';

    const hasPermission = await requestPermissions();
    if (!hasPermission) return '';

    const secondsUntil = Math.floor((expiryTimestamp - Date.now()) / 1000);
    if (secondsUntil <= 0) return '';

    const identifier = await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Parking Timer Expired!',
            body: 'Your parking meter time is up.',
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsUntil,
        },
    });

    return identifier;
};

export const cancelTimerNotification = async (identifier: string): Promise<void> => {
    if (Platform.OS === 'web' || !identifier) return;
    try {
        await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (e) {
        console.warn('Error cancelling notification:', e);
    }
};
