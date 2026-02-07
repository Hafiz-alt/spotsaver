import { Platform } from 'react-native';
import { requestLocationPermission, checkPermissionsStatus } from '../src/utils/permissions';

// Mock dependencies explicitly to ensure control
const mockRequestLocation = jest.fn();
const mockGetLocation = jest.fn();

jest.mock('expo-location', () => ({
    requestForegroundPermissionsAsync: mockRequestLocation,
    getForegroundPermissionsAsync: mockGetLocation,
}));

jest.mock('expo-image-picker', () => ({
    requestCameraPermissionsAsync: jest.fn(),
    getCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

jest.mock('expo-notifications', () => ({
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));

describe('Permissions Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetLocation.mockResolvedValue({ status: 'granted' });
        mockRequestLocation.mockResolvedValue({ status: 'granted' });
    });

    it('should result true if location granted', async () => {
        const result = await requestLocationPermission();
        expect(result).toBe(true);
    });

    it('should result false if location denied', async () => {
        mockRequestLocation.mockResolvedValue({ status: 'denied' });
        const result = await requestLocationPermission();
        expect(result).toBe(false);
    });

    it('should check status correctly', async () => {
        const status = await checkPermissionsStatus();
        expect(status).toEqual(expect.objectContaining({
            location: true,
            notifications: true,
            camera: true
        }));
    });
});
