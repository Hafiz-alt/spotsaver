import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';

export const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
        console.warn('Camera not supported on web in this implementation');
        return false;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return false;
    }
    return true;
};

export const takePhoto = async (): Promise<string | null> => {
    if (Platform.OS === 'web') return null;

    try {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return null;

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.5,
            allowsEditing: false,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            return result.assets[0].uri;
        }
    } catch (error) {
        console.error('Camera Error:', error);
        Alert.alert('Error', 'Failed to take photo');
    }

    return null;
};
