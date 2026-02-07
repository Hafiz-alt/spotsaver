import React from 'react';
import { View, StyleSheet, Text, Platform, Linking } from 'react-native';

export interface MapViewSpotProps {
    lat?: number;
    lng?: number;
    note?: string;
    timestamp?: string;
}

export const MapViewSpot: React.FC<MapViewSpotProps> = ({ lat, lng, note, timestamp }) => {
    if (lat === undefined || lng === undefined) {
        return (
            <View style={styles.fallbackContainer}>
                <Text style={styles.fallbackText}>Location data unavailable</Text>
            </View>
        );
    }

    const handleOpenMap = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.openURL(url);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Map Preview (Web)</Text>
            <Text style={styles.coords}>{lat.toFixed(6)}, {lng.toFixed(6)}</Text>
            {note && <Text style={styles.note}>{note}</Text>}
            <Text style={styles.link} onPress={handleOpenMap}>
                Click to open Google Maps
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 300,
        width: '100%',
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
        overflow: 'hidden',
        marginVertical: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    coords: {
        fontFamily: Platform.OS === 'web' ? 'monospace' : 'System',
        marginBottom: 8,
    },
    note: {
        fontStyle: 'italic',
        marginBottom: 8,
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline',
        cursor: 'pointer', // web only property but harmless here
    },
    fallbackContainer: {
        height: 300,
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 16,
    },
    fallbackText: {
        color: '#666',
        fontSize: 16,
    },
});
