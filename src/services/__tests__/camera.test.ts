import { requestCameraPermission, takePhoto } from '../camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert, Platform } from 'react-native';

jest.mock('expo-image-picker', () => ({
    requestCameraPermissionsAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
    MediaTypeOptions: { Images: 'Images' } // Mock enum-like object
}));

jest.mock('expo-image-manipulator', () => ({
    manipulateAsync: jest.fn(),
    SaveFormat: { JPEG: 'jpeg', PNG: 'png' }
}));

describe('Camera Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('requestCameraPermission returns true if granted', async () => {
        (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        const result = await requestCameraPermission();
        expect(result).toBe(true);
    });

    it('requestCameraPermission returns false if denied', async () => {
        (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
        const result = await requestCameraPermission();
        expect(result).toBe(false);
    });

    it('takePhoto returns compressed uri when successful', async () => {
        (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'file://test.jpg' }]
        });
        (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
            uri: 'file://test-compressed.jpg'
        });

        const uri = await takePhoto();
        expect(uri).toBe('file://test-compressed.jpg');
        expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
            'file://test.jpg',
            [{ resize: { width: 1200 } }],
            { compress: 0.6, format: 'jpeg' }
        );
    });

    it('takePhoto returns null if canceled', async () => {
        (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
            canceled: true,
            assets: null
        });

        const uri = await takePhoto();
        expect(uri).toBeNull();
    });
});
