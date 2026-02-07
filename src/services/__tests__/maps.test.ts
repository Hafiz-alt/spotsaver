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
    };
});

// Import after mock
import { openWalkingDirections } from '../maps';
import { Linking, Platform } from 'react-native';

describe('Maps Service', () => {
    const lat = 37.7749;
    const lng = -122.4194;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('opens correct URL on iOS', async () => {
        // Modify the mocked Platform object
        Platform.OS = 'ios';
        (Platform.select as jest.Mock).mockImplementation((obj) => obj.ios);

        await openWalkingDirections(lat, lng);

        expect(Linking.openURL).toHaveBeenCalledWith(
            `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`
        );
    });

    it('opens correct URL on Android', async () => {
        // Modify the mocked Platform object
        Platform.OS = 'android';
        (Platform.select as jest.Mock).mockImplementation((obj) => obj.android);

        await openWalkingDirections(lat, lng);

        expect(Linking.openURL).toHaveBeenCalledWith(
            `google.navigation:q=${lat},${lng}&mode=w`
        );
    });
});
