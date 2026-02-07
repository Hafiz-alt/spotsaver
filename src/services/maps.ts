import { Linking, Platform } from 'react-native';

export const openWalkingDirections = async (lat: number, lng: number): Promise<void> => {
    const scheme = Platform.select({
        ios: 'maps:',
        android: 'geo:',
    });

    // Standard cross-platform URLs often used:
    // iOS: http://maps.apple.com/?daddr=lat,lng&dirflg=w
    // Android: google.navigation:q=lat,lng&mode=w

    const url = Platform.select({
        ios: `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`,
        android: `google.navigation:q=${lat},${lng}&mode=w`,
    });

    if (url) {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                // Fallback to browser if native app not present (mostly for simulators without maps)
                const browserUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
                await Linking.openURL(browserUrl);
            }
        } catch (err) {
            console.error('An error occurred opening the map', err);
        }
    }
};
