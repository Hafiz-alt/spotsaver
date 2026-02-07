import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleTimerNotification, cancelTimerNotification } from '../services/notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TIMER_STORAGE_KEY = 'parking_timer_expiry';
const NOTIF_ID_KEY = 'parking_timer_notif_id';

export const TimersScreen = () => {
    const [expiryTime, setExpiryTime] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [notificationId, setNotificationId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const navigation = useNavigation<any>();

    // Load saved timer on mount
    useEffect(() => {
        const loadTimer = async () => {
            try {
                const storedExpiry = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
                const storedNotifId = await AsyncStorage.getItem(NOTIF_ID_KEY);

                if (storedExpiry) {
                    const expiry = parseInt(storedExpiry, 10);
                    if (expiry > Date.now()) {
                        setExpiryTime(expiry);
                        setNotificationId(storedNotifId || '');
                    } else {
                        await clearTimer(); // Expired while app closed
                    }
                }
            } catch (e) {
                console.error('Failed to load timer', e);
            } finally {
                setLoading(false);
            }
        };
        loadTimer();
    }, []);

    // Update countdown
    useEffect(() => {
        if (expiryTime) {
            const update = () => {
                const now = Date.now();
                const left = Math.max(0, Math.floor((expiryTime - now) / 1000));
                setTimeLeft(left);

                if (left <= 0) {
                    handleExpiry();
                }
            };

            update(); // Immediate
            intervalRef.current = setInterval(update, 1000);

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        } else {
            setTimeLeft(null);
        }
    }, [expiryTime]);

    const handleExpiry = async () => {
        await clearTimer();
        Alert.alert('Time Up!', 'Your parking timer has expired.');
    };

    const clearTimer = async () => {
        setExpiryTime(null);
        setTimeLeft(null);
        setNotificationId('');
        try {
            await AsyncStorage.multiRemove([TIMER_STORAGE_KEY, NOTIF_ID_KEY]);
        } catch (e) { console.error(e); }
    };

    const startTimer = async (minutes: number) => {
        if (notificationId) {
            await cancelTimerNotification(notificationId);
        }

        const expiry = Date.now() + minutes * 60 * 1000;
        setExpiryTime(expiry);

        try {
            const notifId = await scheduleTimerNotification(expiry);
            setNotificationId(notifId);

            await AsyncStorage.setItem(TIMER_STORAGE_KEY, expiry.toString());
            await AsyncStorage.setItem(NOTIF_ID_KEY, notifId);
        } catch (e) {
            console.error('Failed to save timer', e);
            Alert.alert('Error', 'Failed to schedule timer');
        }
    };

    const cancelTimer = async () => {
        if (notificationId) {
            await cancelTimerNotification(notificationId);
        }
        await clearTimer();
    };

    const extendTimer = async () => {
        if (expiryTime) {
            const remainingMinutes = (expiryTime - Date.now()) / 60000;
            await startTimer(remainingMinutes + 15);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return (
        <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#00C853" />
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#001A33', '#003366']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Parking Timer</Text>
            </LinearGradient>

            <View style={styles.content}>
                {timeLeft !== null ? (
                    <View style={styles.activeContainer}>
                        <View style={styles.timerCircle}>
                            <Text style={styles.timerLabel}>REMAINING</Text>
                            <Text style={styles.timerData}>{formatTime(timeLeft)}</Text>
                        </View>

                        <View style={styles.btnGroup}>
                            <TouchableOpacity style={styles.extendButton} onPress={extendTimer}>
                                <Ionicons name="add-circle" size={24} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.btnText}>Extend (+15m)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cancelButton} onPress={cancelTimer}>
                                <Ionicons name="close-circle" size={24} color="#FF3B30" style={{ marginRight: 8 }} />
                                <Text style={[styles.btnText, { color: '#FF3B30' }]}>Cancel Timer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.presetContainer}>
                        <Text style={styles.presetTitle}>Set a Timer</Text>
                        <Text style={styles.presetSubtitle}>We'll notify you when time is up.</Text>

                        <View style={styles.grid}>
                            <TouchableOpacity style={styles.presetCard} onPress={() => startTimer(15)}>
                                <View style={[styles.iconBg, { backgroundColor: '#E3F2FD' }]}>
                                    <Text style={[styles.presetValue, { color: '#2196F3' }]}>15</Text>
                                </View>
                                <Text style={styles.presetUnit}>Minutes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.presetCard} onPress={() => startTimer(30)}>
                                <View style={[styles.iconBg, { backgroundColor: '#E8F5E9' }]}>
                                    <Text style={[styles.presetValue, { color: '#4CAF50' }]}>30</Text>
                                </View>
                                <Text style={styles.presetUnit}>Minutes</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.presetCard} onPress={() => startTimer(60)}>
                                <View style={[styles.iconBg, { backgroundColor: '#FFF3E0' }]}>
                                    <Text style={[styles.presetValue, { color: '#FF9800' }]}>1</Text>
                                </View>
                                <Text style={styles.presetUnit}>Hour</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.presetCard} onPress={() => startTimer(120)}>
                                <View style={[styles.iconBg, { backgroundColor: '#F3E5F5' }]}>
                                    <Text style={[styles.presetValue, { color: '#9C27B0' }]}>2</Text>
                                </View>
                                <Text style={styles.presetUnit}>Hours</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
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
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
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
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    activeContainer: {
        alignItems: 'center',
        width: '100%',
    },
    timerCircle: {
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        marginBottom: 40,
        borderWidth: 8,
        borderColor: '#F0F9FF',
    },
    timerLabel: {
        fontSize: 14,
        color: '#999',
        letterSpacing: 2,
        marginBottom: 10,
    },
    timerData: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#007AFF',
        fontVariant: ['tabular-nums'],
    },
    btnGroup: {
        width: '100%',
        gap: 15,
    },
    extendButton: {
        flexDirection: 'row',
        backgroundColor: '#00C853',
        paddingVertical: 15,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    cancelButton: {
        flexDirection: 'row',
        backgroundColor: '#FFEBEE',
        paddingVertical: 15,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    presetContainer: {
        width: '100%',
        alignItems: 'center',
    },
    presetTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    presetSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        gap: 15,
    },
    presetCard: {
        width: '47%',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 15,
    },
    iconBg: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    presetValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    presetUnit: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
});
