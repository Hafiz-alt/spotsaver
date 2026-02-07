import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert, Platform, Button, Image, TouchableOpacity, AppState } from 'react-native';
import { SaveButton } from '../components/SaveButton';
import { saveSpot } from '../services/storage';
import { checkPermissionsStatus, openSettings } from '../utils/permissions';
import * as Location from 'expo-location';

import { useNavigation } from '@react-navigation/native';
import { takePhoto } from '../services/camera';
import { useMotionDetection } from '../hooks/useMotionDetection';
import { handleAutoSave } from '../services/autoSave';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const HomeScreen = () => {
    // Phase 8: Removed simulation toggles
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [smartParkingEnabled, setSmartParkingEnabled] = useState(false);
    const [permissions, setPermissions] = useState({ location: true, notifications: true, camera: true });

    const navigation = useNavigation<any>();
    const { isLikelyParked } = useMotionDetection();

    useEffect(() => {
        const check = async () => {
            const status = await checkPermissionsStatus();
            setPermissions(status);
        };

        check();

        // Re-check when returning from settings
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                check();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Auto-Save Effect
    React.useEffect(() => {
        if (smartParkingEnabled && isLikelyParked) {
            handleAutoPrompt();
        }
    }, [smartParkingEnabled, isLikelyParked]);

    const handleAutoPrompt = async () => {
        setSmartParkingEnabled(false);
        await handleAutoSave(
            () => { /* success callback */ },
            () => navigation.navigate('SavedSpot')
        );
    };

    const handleCamera = async () => {
        const uri = await takePhoto();
        if (uri) {
            setCapturedPhoto(uri);
        }
    };

    const handleSave = async () => {
        try {
            // EAFP: Try to get location directly without pre-check.
            // If permission is missing, this will likely throw or return error.
            // We still try requestForegroundPermissionsAsync just in case it's a first-time prompt needed,
            // but we don't block if it returns something weird.

            await import('expo-location').then(m => m.requestForegroundPermissionsAsync());
            const loc = await import('expo-location').then(m => m.getCurrentPositionAsync({}));

            const spot = {
                id: Date.now().toString() + Math.random().toString(36).substring(7),
                lat: loc.coords.latitude,
                lng: loc.coords.longitude,
                timestamp: new Date().toISOString(),
                photoPath: capturedPhoto || undefined,
            };

            await saveSpot(spot);

            // Reset photo after save
            setCapturedPhoto(null);

            if (Platform.OS === 'web') {
                window.alert('Spot Saved Successfully!');
            } else {
                Alert.alert(
                    'Success',
                    'Spot Saved Successfully!',
                    [
                        { text: 'OK' },
                        {
                            text: 'View Spot',
                            onPress: () => navigation.navigate('SavedSpot')
                        }
                    ]
                );
            }
        } catch (error) {
            console.error(error);
            // Only alert if we really failed to get location
            Alert.alert(
                'Location Error',
                'Failed to get location. Please ensure Location is enabled in Settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: openSettings }
                ]
            );
        }
    };

    const renderMenuCard = (title: string, icon: keyof typeof Ionicons.glyphMap, onPress: () => void, color: string = '#333') => (
        <TouchableOpacity style={styles.menuCard} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.menuText}>{title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#001A33', '#003366']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="location" size={28} color="#00C853" />
                    </View>
                    <Text style={styles.headerTitle}>SpotSaver</Text>
                </View>
                <Text style={styles.headerSubtitle}>Find Your Car. Beat the Clock.</Text>
            </LinearGradient>

            <View style={styles.content}>

                {/* Warnings */}
                {!permissions.location && (
                    <TouchableOpacity onPress={openSettings} style={styles.warningBanner}>
                        <Ionicons name="warning" size={20} color="#856404" />
                        <Text style={styles.warningText}>Enable Location Access</Text>
                    </TouchableOpacity>
                )}
                {!permissions.notifications && (
                    <TouchableOpacity onPress={openSettings} style={styles.warningBanner}>
                        <Ionicons name="notifications-off" size={20} color="#856404" />
                        <Text style={styles.warningText}>Enable Notifications</Text>
                    </TouchableOpacity>
                )}

                {/* Main Action */}
                <View style={styles.mainActionArea}>
                    <SaveButton onPress={handleSave} />

                    {capturedPhoto && (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: capturedPhoto }} style={styles.tinyPreview} />
                            <Text style={styles.previewText}>Photo Attached</Text>
                            <TouchableOpacity onPress={() => setCapturedPhoto(null)}>
                                <Ionicons name="close-circle" size={20} color="red" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Secondary Actions Grid */}
                <View style={styles.menuGrid}>
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.actionCard, { marginRight: 10 }]} onPress={handleCamera}>
                            <LinearGradient colors={['#F0F4FF', '#E6EEFF']} style={styles.cardGradient}>
                                <Ionicons name="camera" size={32} color="#007AFF" />
                                <Text style={styles.actionText}>{capturedPhoto ? "Retake Photo" : "Take Photo"}</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('SavedSpot')}>
                            <LinearGradient colors={['#F0FFF4', '#E6FFFA']} style={styles.cardGradient}>
                                <Ionicons name="map" size={32} color="#00C853" />
                                <Text style={styles.actionText}>View Spot</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.menuList}>
                        {renderMenuCard("Parking Timer", "time", () => navigation.navigate('Timers'), "#FF9500")}
                        {renderMenuCard("Parking History", "list", () => navigation.navigate('History'), "#5856D6")}
                    </View>
                </View>

                {/* Footer Controls */}
                <View style={styles.footer}>
                    <View style={styles.switchRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="car-sport" size={20} color="#666" style={{ marginRight: 8 }} />
                            <Text style={styles.switchLabel}>Smart Auto-Detect</Text>
                        </View>
                        <Switch
                            value={smartParkingEnabled}
                            onValueChange={setSmartParkingEnabled}
                            trackColor={{ false: "#767577", true: "#00C853" }}
                        />
                    </View>
                    {smartParkingEnabled && isLikelyParked && (
                        <Text style={styles.statusText}>Status: Parked</Text>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#B0C4DE',
        fontWeight: '500',
        paddingLeft: 52, // Align with title
    },
    content: {
        flex: 1,
        padding: 20,
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3CD',
        padding: 12,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#FFEEBA',
    },
    warningText: {
        color: '#856404',
        fontWeight: '600',
        marginLeft: 10,
        fontSize: 14,
    },
    mainActionArea: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    previewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 20,
        marginTop: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tinyPreview: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    previewText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginRight: 8,
    },
    menuGrid: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    actionCard: {
        flex: 1,
        height: 100,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    cardGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    actionText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    menuList: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    menuCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    footer: {
        marginTop: 'auto',
        paddingTop: 20,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 15,
        elevation: 1,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    statusText: {
        textAlign: 'center',
        color: '#00C853',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 8,
    },
});
