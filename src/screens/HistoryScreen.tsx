import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getAllSpots } from '../services/storage';
import { Spot } from '../models/Spot';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export const HistoryScreen = () => {
    const [history, setHistory] = useState<Spot[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const loadHistory = async () => {
        setLoading(true);
        try {
            const spots = await getAllSpots();
            console.log('[DEBUG] HistoryScreen loaded spots:', spots.length);

            // Sort by newest first with defensive null checks
            // FIXED: Don't filter out spots just because they lack an id - only filter null/undefined
            const sorted = spots
                .filter(spot => spot != null) // Only filter out null/undefined
                .sort((a, b) => {
                    const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return dateB - dateA;
                });
            console.log('[DEBUG] HistoryScreen after filter/sort:', sorted.length);
            setHistory(sorted);
        } catch (e) {
            console.error('Error loading history:', e);
            setHistory([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handlePress = (spot: Spot) => {
        navigation.navigate('SavedSpot', { spot });
    };

    const renderItem = ({ item }: { item: Spot }) => (
        <TouchableOpacity style={styles.item} onPress={() => handlePress(item)} activeOpacity={0.7}>
            {item.photoPath ? (
                <Image source={{ uri: item.photoPath }} style={styles.thumbnail} />
            ) : (
                <View style={[styles.thumbnail, styles.placeholderThumb]}>
                    <Ionicons name="map" size={20} color="#ccc" />
                </View>
            )}

            <View style={styles.textContainer}>
                <Text style={styles.date}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
                {item.note && <Text style={styles.note} numberOfLines={1}>{item.note}</Text>}
            </View>

            <View style={styles.actionContainer}>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
        </TouchableOpacity>
    );

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
                <Text style={styles.headerTitle}>Parking History</Text>
            </LinearGradient>

            {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="time-outline" size={64} color="#ccc" />
                    <Text style={styles.empty}>No history found.</Text>
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={styles.listContent}
                    data={history}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                />
            )}
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        fontSize: 16,
        color: '#666',
        marginTop: 20,
    },
    listContent: {
        padding: 20,
    },
    item: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 12,
        marginRight: 15,
        backgroundColor: '#eee',
    },
    placeholderThumb: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F4F8',
    },
    textContainer: {
        flex: 1,
    },
    date: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    time: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    note: {
        fontSize: 12,
        color: '#555',
        marginTop: 4,
        fontStyle: 'italic',
    },
    actionContainer: {
        justifyContent: 'center',
        paddingLeft: 10,
    },
});
