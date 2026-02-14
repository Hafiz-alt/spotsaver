import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, Platform, Alert, Linking } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getLastSpot } from '../services/storage';
import { Spot } from '../models/Spot';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const SavedSpotScreen = ({ route }: any) => {
    const [spot, setSpot] = useState<Spot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // @ts-ignore
    const routeSpot = route.params?.spot;
    const navigation = useNavigation<any>();

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchSpot = async () => {
                setLoading(true);
                setError(null);
                try {
                    // 1. If passed via params (from History), use that.
                    if (routeSpot) {
                        if (isActive) {
                            if (!routeSpot.id) {
                                console.warn("SavedSpotScreen: Received invalid spot from route (missing id)");
                                // Don't fail hard, just try storage or error out?
                                // Let's set it but assume it might be partial.
                            }
                            setSpot(routeSpot);
                        }
                        return;
                    }

                    // 2. Otherwise fetch last saved
                    const lastSpot = await getLastSpot();

                    if (isActive) {
                        if (lastSpot) {
                            setSpot(lastSpot);
                        } else {
                            setSpot(null);
                        }
                    }
                } catch (e: any) {
                    console.error('SavedSpotScreen: Error loading spot', e);
                    if (isActive) setError("Failed to load saved spot.");
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

    const openGoogleMaps = () => {
        try {
            if (spot && typeof spot.lat === 'number' && typeof spot.lng === 'number') {
                const url = `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`;
                Linking.openURL(url).catch(err => {
                    console.error("Couldn't open Google Maps", err);
                    Alert.alert("Error", "Could not open Google Maps.");
                });
            } else {
                Alert.alert("Error", "Location data unavailable.");
            }
        } catch (err) {
            Alert.alert("Error", "An unexpected error occurred opening maps.");
        }
    };

    const openWaze = () => {
        try {
            if (spot && typeof spot.lat === 'number' && typeof spot.lng === 'number') {
                const url = `https://waze.com/ul?ll=${spot.lat},${spot.lng}&navigate=yes`;
                Linking.openURL(url).catch(err => {
                    console.error("Couldn't open Waze", err);
                    Alert.alert("Error", "Could not open Waze.");
                });
            } else {
                Alert.alert("Error", "Location data unavailable.");
            }
        } catch (err) {
            Alert.alert("Error", "An unexpected error occurred opening Waze.");
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#00C853" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={['#001A33', '#003366']} style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Error</Text>
                </LinearGradient>
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
                    <Text style={[styles.emptyText, { color: '#FF3B30' }]}>{error}</Text>
                    <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.homeButtonText}>Go Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Wrap the content in ErrorBoundary to catch any render-time crashes
    return (
        <ErrorBoundary fallback={
            <View style={styles.container}>
                <LinearGradient colors={['#001A33', '#003366']} style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Something went wrong</Text>
                </LinearGradient>
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
                    <Text style={styles.emptyText}>An unexpected error occurred.</Text>
                    <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.homeButtonText}>Go Home</Text>
                    </TouchableOpacity>
                </View>
            </View>
        }>
            <SavedSpotContent
                spot={spot}
                navigation={navigation}
                openGoogleMaps={openGoogleMaps}
                openWaze={openWaze}
            />
        </ErrorBoundary>
    );
};

// Separated component for cleaner ErrorBoundary wrapping
const SavedSpotContent = ({ spot, navigation, openGoogleMaps, openWaze }: any) => {
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

    // Safe Photo URI check
    const hasPhoto = !!spot.photoPath && typeof spot.photoPath === 'string' && spot.photoPath.trim().length > 0;
    const hasLocation = typeof spot.lat === 'number' && typeof spot.lng === 'number';

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
                {hasPhoto ? (
                    <View style={styles.card}>
                        <Image
                            source={{ uri: spot.photoPath }}
                            style={styles.photo}
                            onError={(e) => console.warn("Image load error", e.nativeEvent.error)}
                        />
                        <View style={styles.photoLabel}>
                            <Ionicons name="camera" size={14} color="white" style={{ marginRight: 4 }} />
                            <Text style={{ color: 'white', fontSize: 12 }}>Attached Photo</Text>
                        </View>
                    </View>
                ) : null}

                {/* Location Info Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="location" size={20} color="#007AFF" />
                        <Text style={styles.cardTitle}>Location Details</Text>
                    </View>

                    <View style={styles.infoContent}>
                        {/* Date/Time */}
                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Ionicons name="time" size={24} color="#FF9500" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Saved At</Text>
                                <Text style={styles.infoValue}>
                                    {spot.timestamp ? new Date(spot.timestamp).toLocaleString() : 'Unknown date'}
                                </Text>
                            </View>
                        </View>

                        {/* Coordinates */}
                        <View style={[styles.infoRow, { marginTop: 10 }]}>
                            <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="compass" size={24} color="#007AFF" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Coordinates</Text>
                                {hasLocation ? (
                                    <Text style={styles.infoValue}>{spot.lat.toFixed(6)}, {spot.lng.toFixed(6)}</Text>
                                ) : (
                                    <Text style={[styles.infoValue, { color: '#FF3B30' }]}>Location data unavailable</Text>
                                )}
                            </View>
                        </View>

                        {/* Note */}
                        {spot.note ? (
                            <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 15, marginTop: 10 }]}>
                                <View style={[styles.iconBox, { backgroundColor: '#f0f0f0' }]}>
                                    <Ionicons name="text" size={24} color="#666" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.infoLabel}>Notes</Text>
                                    <Text style={styles.infoValue}>{spot.note}</Text>
                                </View>
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* External Navigation Buttons */}
                {hasLocation && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={openGoogleMaps} activeOpacity={0.8} style={styles.actionButtonWrapper}>
                            <LinearGradient
                                colors={['#4285F4', '#34A853']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.actionButton}
                            >
                                <Ionicons name="map" size={24} color="white" style={{ marginRight: 10 }} />
                                <Text style={styles.actionButtonText}>Open in Google Maps</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={openWaze} activeOpacity={0.8} style={styles.actionButtonWrapper}>
                            <LinearGradient
                                colors={['#33CCFF', '#0099FF']} // Waze-like colors
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.actionButton}
                            >
                                <Ionicons name="car-sport" size={24} color="white" style={{ marginRight: 10 }} />
                                <Text style={styles.actionButtonText}>Open in Waze</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {!hasLocation && (
                    <View style={styles.fallbackBox}>
                        <Text style={styles.fallbackText}>Navigation is disabled because location data is missing.</Text>
                    </View>
                )}

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
        height: 250,
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
    cardHeader: {
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
    infoContent: {
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
    buttonContainer: {
        marginTop: 10,
    },
    actionButtonWrapper: {
        marginBottom: 15,
    },
    actionButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    actionButtonText: {
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
        textAlign: 'center'
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
    fallbackBox: {
        padding: 20,
        backgroundColor: '#FFF0F0',
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10
    },
    fallbackText: {
        color: '#FF3B30',
        textAlign: 'center'
    }
});
