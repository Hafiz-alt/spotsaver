import { requestCameraPermission, takePhoto } from '../camera';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

jest.mock('expo-image-picker', () => ({
    requestCameraPermissionsAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
    MediaTypeOptions: { Images: 'Images' } // Mock enum-like object
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

    it('takePhoto returns uri when successful', async () => {
        (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
        (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'file://test.jpg' }]
        });

        const uri = await takePhoto();
        expect(uri).toBe('file://test.jpg');
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
