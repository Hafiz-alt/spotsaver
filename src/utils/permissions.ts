import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const openSettings = async () => {
    try {
        await Linking.openSettings();
    } catch (error) {
        console.error('Error opening settings:', error);
    }
};

export const requestLocationPermission = async (): Promise<boolean> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Location permission error:', error);
        return false;
    }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;

    try {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Notification permission error:', error);
        return false;
    }
};

export const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;

    try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Camera permission error:', error);
        return false;
    }
};

export const checkPermissionsStatus = async () => {
    try {
        const location = await Location.getForegroundPermissionsAsync();
        const notifications = await Notifications.getPermissionsAsync();
        const camera = await ImagePicker.getCameraPermissionsAsync();

        return {
            location: location.status === 'granted',
            notifications: notifications.status === 'granted',
            camera: camera.status === 'granted',
        };
    } catch (error) {
        console.error('Error checking permissions:', error);
        return {
            location: false,
            notifications: false,
            camera: false,
        };
    }
};
