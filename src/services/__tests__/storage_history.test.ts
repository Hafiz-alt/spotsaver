import { saveSpot, getLastSpot, getAllSpots, clearAllSpots } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Storage Service', () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
    });

    it('getAllSpots returns empty array when nothing saved', async () => {
        const spots = await getAllSpots();
        expect(spots).toEqual([]);
    });

    it('getAllSpots returns history with multiple items', async () => {
        const spot1 = { id: '1', lat: 10, lng: 10, timestamp: '2023-01-01' };
        const spot2 = { id: '2', lat: 20, lng: 20, timestamp: '2023-01-02' };

        await saveSpot(spot1);
        await saveSpot(spot2);

        const spots = await getAllSpots();
        expect(spots.length).toBe(2);
        // Expect latest first (LIFO) based on implementation in storage.ts
        expect(spots[0].id).toBe('2');
        expect(spots[1].id).toBe('1');
    });
});
