import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert, Platform, Button, Image, TouchableOpacity, AppState, TextInput, ScrollView } from 'react-native';
import { SaveButton } from '../components/SaveButton';
import { saveSpot, getVehicles, getActiveVehicle } from '../services/storage';
import { Vehicle } from '../models/Vehicle';
import { checkPermissionsStatus, openSettings } from '../utils/permissions';
import { calculateDistance, formatDistance } from '../utils/distance';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

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
    const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
    const [parkingNote, setParkingNote] = useState('');
    const [distanceToSpot, setDistanceToSpot] = useState<number | null>(null);
    const [savedSpot, setSavedSpot] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

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

    // Load active vehicle
    useEffect(() => {
        loadActiveVehicle();
    }, []);

    const loadActiveVehicle = async () => {
        try {
            const activeId = await getActiveVehicle();
            if (activeId) {
                const vehicles = await getVehicles();
                const vehicle = vehicles.find(v => v.id === activeId);
                setActiveVehicle(vehicle || null);
            }
        } catch (e) {
            console.error('Error loading active vehicle:', e);
        }
    };

    // Load saved spot and calculate distance
    useEffect(() => {
        loadSavedSpot();
    }, []);

    const loadSavedSpot = async () => {
        try {
            const { getLastSpot } = await import('../services/storage');
            const spot = await getLastSpot();
            setSavedSpot(spot);
        } catch (e) {
            console.error('Error loading saved spot:', e);
        }
    };

    // Calculate distance with auto-update every 10 seconds
    useEffect(() => {
        if (!savedSpot) {
            setDistanceToSpot(null);
            return;
        }

        const updateDistance = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;

                const location = await Location.getCurrentPositionAsync({});
                const distance = calculateDistance(
                    location.coords.latitude,
                    location.coords.longitude,
                    savedSpot.lat,
                    savedSpot.lng
                );
                setDistanceToSpot(distance);
            } catch (e) {
                console.error('Error calculating distance:', e);
            }
        };

        updateDistance();
        const interval = setInterval(updateDistance, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, [savedSpot]);

    // Auto-Save Effect
    React.useEffect(() => {
        console.log('[DEBUG] Auto-save effect triggered. smartParkingEnabled:', smartParkingEnabled, 'isLikelyParked:', isLikelyParked);
        if (smartParkingEnabled && isLikelyParked) {
            console.log('[DEBUG] Triggering auto-save prompt!');
            handleAutoPrompt();
        }
    }, [smartParkingEnabled, isLikelyParked]);

    const handleAutoPrompt = async () => {
        console.log('[DEBUG] handleAutoPrompt called');
        setSmartParkingEnabled(false);
        await handleAutoSave(
            () => { /* success callback */ },
            () => navigation.navigate('SavedSpot')
        );
    };

    const handleCamera = async () => {
        const uri = await takePhoto(); // Already compressed in camera.ts
        if (uri) {
            setCapturedPhoto(uri);
        }
    };

    const handleSave = async () => {
        // Set loading state immediately for instant UI feedback
        setIsSaving(true);

        try {
            // EAFP: Try to get location directly without pre-check.
            await import('expo-location').then(m => m.requestForegroundPermissionsAsync());
            const loc = await import('expo-location').then(m => m.getCurrentPositionAsync({}));

            const spot = {
                id: Date.now().toString() + Math.random().toString(36).substring(7),
                lat: loc.coords.latitude,
                lng: loc.coords.longitude,
                timestamp: new Date().toISOString(),
                photoPath: capturedPhoto || undefined,
                vehicleId: activeVehicle?.id,
                note: parkingNote.trim() || undefined,
            };

            // Save spot asynchronously
            await saveSpot(spot);

            // Reset photo and note after save
            setCapturedPhoto(null);
            setParkingNote('');

            // Reload saved spot for distance calculation
            await loadSavedSpot();

            // Haptic feedback for success
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Show success toast instead of blocking alert
            showToast('✓ Spot Saved Successfully!');

        } catch (error) {
            console.error('Error saving spot:', error);
            showToast('✗ Failed to save spot');
        } finally {
            // Always reset loading state
            setIsSaving(false);
        }
    };

    // Simple toast notification function
    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000); // Auto-dismiss after 3 seconds
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

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

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

                {/* Active Vehicle Display */}
                {activeVehicle && (
                    <TouchableOpacity
                        style={styles.vehicleCard}
                        onPress={() => navigation.navigate('Vehicles')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.vehicleCardContent}>
                            <View style={styles.vehicleIcon}>
                                <Ionicons name="car" size={24} color="#007AFF" />
                            </View>
                            <View style={styles.vehicleDetails}>
                                <Text style={styles.vehicleLabel}>Active Vehicle</Text>
                                <Text style={styles.vehicleName}>{activeVehicle.name}</Text>
                                <Text style={styles.vehiclePlate}>{activeVehicle.plateNumber}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </View>
                    </TouchableOpacity>
                )}

                {/* No Vehicle Prompt */}
                {!activeVehicle && (
                    <TouchableOpacity
                        style={styles.noVehicleCard}
                        onPress={() => navigation.navigate('Vehicles')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add-circle" size={24} color="#007AFF" />
                        <Text style={styles.noVehicleText}>Add a Vehicle</Text>
                    </TouchableOpacity>
                )}

                {/* Main Save Action */}
                <View style={styles.mainActionArea}>
                    <SaveButton onPress={handleSave} loading={isSaving} disabled={!permissions.location} />

                    {capturedPhoto && (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: capturedPhoto }} style={styles.tinyPreview} />
                            <Text style={styles.previewText}>Photo attached</Text>
                            <TouchableOpacity onPress={() => setCapturedPhoto(null)}>
                                <Ionicons name="close-circle" size={20} color="red" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Parking Note Input */}
                <View style={styles.noteInputContainer}>
                    <View style={styles.noteHeader}>
                        <Ionicons name="document-text-outline" size={20} color="#666" />
                        <Text style={styles.noteLabel}>Parking Notes (Optional)</Text>
                    </View>
                    <TextInput
                        style={styles.noteInput}
                        placeholder="e.g., Basement B2, Near Lift, Section A"
                        placeholderTextColor="#999"
                        value={parkingNote}
                        onChangeText={setParkingNote}
                        multiline
                        numberOfLines={2}
                        maxLength={150}
                    />
                    {parkingNote.length > 0 && (
                        <Text style={styles.charCount}>{parkingNote.length}/150</Text>
                    )}
                </View>

                {/* Saved Spot Info */}
                {savedSpot && distanceToSpot !== null && (
                    <View style={styles.distanceCard}>
                        <View style={styles.distanceIcon}>
                            <Ionicons name="walk" size={24} color="#FF9500" />
                        </View>
                        <View style={styles.distanceInfo}>
                            <Text style={styles.distanceLabel}>Distance to Vehicle</Text>
                            <Text style={styles.distanceValue}>{formatDistance(distanceToSpot)}</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('SavedSpot')}>
                            <Ionicons name="navigate-circle" size={32} color="#007AFF" />
                        </TouchableOpacity>
                    </View>
                )}

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
            </ScrollView>

            {/* Toast Notification */}
            {toastMessage && (
                <View style={styles.toastContainer}>
                    <View style={styles.toast}>
                        <Text style={styles.toastText}>{toastMessage}</Text>
                    </View>
                </View>
            )}
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
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    noVehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F4F8',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#007AFF',
        borderStyle: 'dashed',
    },
    noVehicleText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
        marginLeft: 10,
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
    vehicleCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    vehicleCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vehicleIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E6F2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    vehicleDetails: {
        flex: 1,
    },
    vehicleLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    vehiclePlate: {
        fontSize: 14,
        color: '#666',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontWeight: '600',
    },
    noteInputContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    noteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    noteLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginLeft: 8,
    },
    noteInput: {
        backgroundColor: '#F7F9FC',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#333',
        minHeight: 60,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 5,
    },
    distanceCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    distanceIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    distanceInfo: {
        flex: 1,
    },
    distanceLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    distanceValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF9500',
    },
    toastContainer: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
    },
    toast: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 25,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    toastText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
