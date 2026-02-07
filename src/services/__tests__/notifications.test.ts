import { scheduleTimerNotification, cancelTimerNotification } from '../notifications';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    scheduleNotificationAsync: jest.fn(() => Promise.resolve('test-uuid')),
    cancelScheduledNotificationAsync: jest.fn(),
    SchedulableTriggerInputTypes: {
        TIME_INTERVAL: 'timeInterval'
    }
}));

describe('Notifications Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('scheduleTimerNotification schedules a notification', async () => {
        const expiry = Date.now() + 60000; // 1 min from now
        const id = await scheduleTimerNotification(expiry);

        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.objectContaining({ title: 'Parking Timer Expired!' }),
            trigger: expect.objectContaining({ seconds: expect.any(Number) })
        }));
        expect(id).toBe('test-uuid');
    });

    it('cancelTimerNotification calls cancel', async () => {
        await cancelTimerNotification('test-id');
        expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('test-id');
    });
});
