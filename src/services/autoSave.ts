import { Alert, Platform } from 'react-native';
import { saveSpot } from './storage';
import { simulateLocation } from '../utils/simulateLocation';

export const handleAutoSave = async (
    onSaveSuccess: () => void,
    onNavigate: () => void
) => {
    Alert.alert(
        'Smart Parking',
        'Looks like you have parked. Save this spot?',
        [
            {
                text: 'No',
                style: 'cancel',
            },
            {
                text: 'Yes, Save Spot',
                onPress: async () => {
                    try {
                        const location = simulateLocation(); // In real app, get real location
                        const spot = {
                            id: Date.now().toString() + Math.random().toString(36).substring(7),
                            lat: location.latitude,
                            lng: location.longitude,
                            timestamp: new Date().toISOString(),
                            note: 'Auto-saved via Smart Parking'
                        };

                        await saveSpot(spot);
                        onSaveSuccess();

                        // Optional: Navigate specifically or just show success
                        if (Platform.OS !== 'web') {
                            Alert.alert('Saved!', 'Location saved automatically.', [
                                { text: 'View Spot', onPress: onNavigate },
                                { text: 'OK' }
                            ]);
                        }
                    } catch (error) {
                        console.error(error);
                    }
                },
            },
        ]
    );
};
