import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
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

/**
 * Compress image to reduce file size and improve performance
 * @param uri - Original image URI
 * @returns Compressed image URI
 */
const compressImage = async (uri: string): Promise<string> => {
    try {
        const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1200 } }], // Max width 1200px, maintains aspect ratio
            { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        );
        return manipResult.uri;
    } catch (error) {
        console.warn('Image compression failed, using original:', error);
        return uri; // Fallback to original if compression fails
    }
};

export const takePhoto = async (): Promise<string | null> => {
    if (Platform.OS === 'web') return null;

    try {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return null;

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8, // Initial quality (will be compressed further)
            allowsEditing: false,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const originalUri = result.assets[0].uri;
            // Compress image before returning
            const compressedUri = await compressImage(originalUri);
            return compressedUri;
        }
    } catch (error) {
        console.error('Camera Error:', error);
        Alert.alert('Error', 'Failed to take photo');
    }

    return null;
};
