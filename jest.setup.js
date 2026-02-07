// Mock react-native BEFORE imports
jest.mock('react-native', () => {
    return {
        Linking: {
            openURL: jest.fn(),
            canOpenURL: jest.fn(() => Promise.resolve(true)),
        },
        Platform: {
            OS: 'ios',
            select: jest.fn((obj) => obj.ios),
        },
        ActivityIndicator: 'ActivityIndicator',
        View: 'View',
        Text: 'Text',
        Button: 'Button',
        StyleSheet: { create: (obj) => obj },
        Alert: { alert: jest.fn() },
    };
});

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

import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
global.__DEV__ = true;
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
