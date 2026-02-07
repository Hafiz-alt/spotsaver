import { simulateLocation } from '../src/utils/simulateLocation';

test('simulateLocation returns coordinates', () => {
    const loc = simulateLocation();
    expect(loc).toHaveProperty('latitude');
    expect(loc).toHaveProperty('longitude');
});
