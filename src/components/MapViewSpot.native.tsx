import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

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

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
                provider={PROVIDER_DEFAULT}
            >
                <Marker
                    coordinate={{ latitude: lat, longitude: lng }}
                    title="Saved Spot"
                    description={note || `Saved at ${new Date(timestamp || '').toLocaleTimeString()}`}
                />
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 300,
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        marginVertical: 16,
    },
    map: {
        flex: 1,
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
