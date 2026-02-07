import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getLastSpot } from '../services/storage';
import { Spot } from '../models/Spot';
import { MapViewSpot } from '../components/MapViewSpot';
import { openWalkingDirections } from '../services/maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export const SavedSpotScreen = ({ route }: any) => {
    const [spot, setSpot] = useState<Spot | null>(null);
    const [loading, setLoading] = useState(true);
    // @ts-ignore
    const routeSpot = route.params?.spot;
    const navigation = useNavigation<any>();

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchSpot = async () => {
                setLoading(true);
                try {
                    // If passed via params (from History), use that.
                    if (routeSpot) {
                        if (isActive) setSpot(routeSpot);
                        setLoading(false);
                        return;
                    }

                    // Otherwise fetch last saved
                    const lastSpot = await getLastSpot();
                    if (isActive) {
                        setSpot(lastSpot);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    if (isActive) {
                        setLoading(false);
                    }
                }
            };

            fetchSpot();

            return () => {
                isActive = false;
            };
        }, [routeSpot])
    );

    const handleNavigate = () => {
        if (spot) {
            openWalkingDirections(spot.lat, spot.lng);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#00C853" />
            </View>
        );
    }

    if (!spot) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={['#001A33', '#003366']} style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Details</Text>
                </LinearGradient>
                <View style={styles.emptyContainer}>
                    <Ionicons name="car-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No parking spot saved yet</Text>
                    <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.homeButtonText}>Go Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#001A33', '#003366']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Spot</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Photo Card */}
                {spot.photoPath ? (
                    <View style={styles.card}>
                        <Image source={{ uri: spot.photoPath }} style={styles.photo} />
                        <View style={styles.photoLabel}>
                            <Ionicons name="camera" size={14} color="white" style={{ marginRight: 4 }} />
                            <Text style={{ color: 'white', fontSize: 12 }}>Attached Photo</Text>
                        </View>
                    </View>
                ) : null}

                {/* Map Card */}
                <View style={styles.card}>
                    <View style={styles.mapHeader}>
                        <Ionicons name="map" size={20} color="#007AFF" />
                        <Text style={styles.cardTitle}>Location</Text>
                    </View>
                    <View style={styles.mapContainer}>
                        <MapViewSpot
                            lat={spot.lat}
                            lng={spot.lng}
                            note={spot.note}
                            timestamp={spot.timestamp}
                        />
                    </View>
                    <View style={styles.coordsRow}>
                        <Text style={styles.coordsText}>{spot.lat.toFixed(6)}, {spot.lng.toFixed(6)}</Text>
                    </View>
                </View>

                {/* Info Card */}
                <View style={[styles.card, styles.infoCard]}>
                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <Ionicons name="time" size={24} color="#FF9500" />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>Saved At</Text>
                            <Text style={styles.infoValue}>{new Date(spot.timestamp).toLocaleString()}</Text>
                        </View>
                    </View>

                    {spot.note && (
                        <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 15 }]}>
                            <View style={[styles.iconBox, { backgroundColor: '#f0f0f0' }]}>
                                <Ionicons name="text" size={24} color="#666" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoLabel}>Notes</Text>
                                <Text style={styles.infoValue}>{spot.note}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Action Button */}
                <TouchableOpacity onPress={handleNavigate} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#007AFF', '#00C853']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.navigateButton}
                    >
                        <Ionicons name="navigate" size={24} color="white" style={{ marginRight: 10 }} />
                        <Text style={styles.navigateText}>Navigate to Car</Text>
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 5,
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    photo: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    photoLabel: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    mapHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#333',
    },
    mapContainer: {
        height: 200,
        width: '100%',
    },
    coordsRow: {
        padding: 10,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
    },
    coordsText: {
        fontSize: 12,
        color: '#666',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    infoCard: {
        padding: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFF4E5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoLabel: {
        fontSize: 12,
        color: '#999',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    navigateButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    navigateText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 20,
        marginBottom: 30,
    },
    homeButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        backgroundColor: '#007AFF',
        borderRadius: 25,
    },
    homeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
