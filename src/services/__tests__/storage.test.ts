import { saveSpot, getLastSpot, getAllSpots, clearAllSpots } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spot } from '../../models/Spot';

describe('Storage Service', () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
        jest.clearAllMocks();
    });

    const mockSpot: Spot = {
        id: 'test-uuid-1',
        lat: 37.7749,
        lng: -122.4194,
        timestamp: new Date().toISOString(),
        note: 'Test parking spot',
    };

    it('saveSpot should persist data correctly', async () => {
        await saveSpot(mockSpot);

        // Verify getLastSpot
        const lastSpot = await getLastSpot();
        expect(lastSpot).toEqual(mockSpot);

        // Verify getAllSpots
        const allSpots = await getAllSpots();
        expect(allSpots).toHaveLength(1);
        expect(allSpots[0]).toEqual(mockSpot);
    });

    it('saveSpot should append to history (LIFO)', async () => {
        const spot1 = { ...mockSpot, id: '1', timestamp: '2023-01-01' };
        const spot2 = { ...mockSpot, id: '2', timestamp: '2023-01-02' };

        await saveSpot(spot1);
        await saveSpot(spot2);

        const allSpots = await getAllSpots();
        expect(allSpots).toHaveLength(2);
        expect(allSpots[0]).toEqual(spot2); // Latest first
        expect(allSpots[1]).toEqual(spot1);

        const last = await getLastSpot();
        expect(last).toEqual(spot2);
    });

    it('clearAllSpots should remove all data', async () => {
        await saveSpot(mockSpot);
        await clearAllSpots();

        const last = await getLastSpot();
        const all = await getAllSpots();

        expect(last).toBeNull();
        expect(all).toEqual([]);
    });
});
