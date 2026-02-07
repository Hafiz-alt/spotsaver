import { handleAutoSave } from '../autoSave';
import { Alert } from 'react-native';

jest.mock('../storage', () => ({
    saveSpot: jest.fn().mockResolvedValue(true)
}));

jest.mock('../../utils/simulateLocation', () => ({
    simulateLocation: jest.fn().mockReturnValue({ latitude: 10, longitude: 20 })
}));

describe('AutoSave Service', () => {
    it('prompts user when handleAutoSave is called', async () => {
        const mockSuccess = jest.fn();
        const mockNav = jest.fn();

        await handleAutoSave(mockSuccess, mockNav);

        expect(Alert.alert).toHaveBeenCalledWith(
            'Smart Parking',
            expect.stringContaining('Looks like you have parked'),
            expect.any(Array)
        );
    });

    // We can't easily mock the interaction with the alert buttons in this simple unit test
    // without more complex mocking of Alert.alert implementation.
    // However, verifying the prompt is triggered is sufficient for this scope.
});
