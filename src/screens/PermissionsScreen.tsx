import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { checkPermissionsStatus, requestCameraPermission, requestLocationPermission, requestNotificationPermission } from '../utils/permissions';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export const PermissionsScreen = () => {
    const navigation = useNavigation<any>();
    const [permissions, setPermissions] = useState({
        location: false,
        notifications: false,
        camera: false,
    });

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        const status = await checkPermissionsStatus();
        setPermissions(status);
    };

    const handleLocation = async () => {
        const granted = await requestLocationPermission();
        if (!granted) {
            Alert.alert('Permission Required', 'Location is used to save your parking spot position.');
        }
        checkStatus();
    };

    const handleNotifications = async () => {
        const granted = await requestNotificationPermission();
        if (!granted) {
            Alert.alert('Permission Skipped', 'You might miss parking timer alerts.');
        }
        checkStatus();
    };

    const handleCamera = async () => {
        const granted = await requestCameraPermission();
        if (!granted) {
            Alert.alert('Permission Skipped', 'You won\'t be able to attach photos to your spot.');
        }
        checkStatus();
    };

    const handleContinue = async () => {
        if (!permissions.location) {
            Alert.alert(
                'Location Missing',
                'Without location, the app cannot remember where you parked. Are you sure?',
                [
                    { text: 'Go Back', style: 'cancel' },
                    {
                        text: 'Continue Anyway',
                        style: 'destructive',
                        onPress: completeOnboarding
                    }
                ]
            );
        } else {
            completeOnboarding();
        }
    };

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('hasFinishedOnboarding', 'true');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (e) {
            console.error('Failed to save onboarding status', e);
        }
    };

    const renderPermissionCard = (title: string, desc: string, icon: keyof typeof Ionicons.glyphMap, granted: boolean, onPress: () => void) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, granted ? styles.iconBoxGranted : styles.iconBoxPending]}>
                    <Ionicons name={icon} size={24} color={granted ? "white" : "#007AFF"} />
                </View>
                <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.cardDesc}>{desc}</Text>
                </View>
                {granted && <Ionicons name="checkmark-circle" size={24} color="#00C853" />}
            </View>

            {!granted && (
                <TouchableOpacity onPress={onPress} style={styles.allowButton}>
                    <Text style={styles.allowButtonText}>Allow Access</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#F7F9FC', '#E3F2FD']} style={styles.bgGradient}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.topSection}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="location" size={40} color="white" />
                        </View>
                        <Text style={styles.welcomeText}>Welcome to SpotSaver</Text>
                        <Text style={styles.subtitleText}>Get the most out of your parking assistant by enabling these features.</Text>
                    </View>

                    <View style={styles.cardsContainer}>
                        {renderPermissionCard(
                            "Location Service",
                            "Required to automatically save your car's position.",
                            "location",
                            permissions.location,
                            handleLocation
                        )}

                        {renderPermissionCard(
                            "Notifications",
                            "Get alerted when your parking timer is running out.",
                            "notifications",
                            permissions.notifications,
                            handleNotifications
                        )}

                        {renderPermissionCard(
                            "Camera Access",
                            "Take photo reminders of your parking spot.",
                            "camera",
                            permissions.camera,
                            handleCamera
                        )}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
                        <LinearGradient colors={['#007AFF', '#00C853']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBtn}>
                            <Text style={styles.continueText}>Start Using SpotSaver</Text>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    bgGradient: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    topSection: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    cardsContainer: {
        gap: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconBoxPending: {
        backgroundColor: '#E3F2FD',
    },
    iconBoxGranted: {
        backgroundColor: '#00C853',
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
    },
    allowButton: {
        marginTop: 12,
        backgroundColor: '#F0F9FF',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    allowButtonText: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 14,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    continueButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
    },
    gradientBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
});
