import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getVehicles, deleteVehicle, setActiveVehicle, getActiveVehicle } from '../services/storage';
import { Vehicle } from '../models/Vehicle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export const VehicleScreen = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    useFocusEffect(
        useCallback(() => {
            loadVehicles();
        }, [])
    );

    const loadVehicles = async () => {
        setLoading(true);
        try {
            const [vehicleList, activeId] = await Promise.all([
                getVehicles(),
                getActiveVehicle()
            ]);
            setVehicles(vehicleList);
            setActiveVehicleId(activeId);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSetActive = async (vehicleId: string) => {
        try {
            await setActiveVehicle(vehicleId);
            setActiveVehicleId(vehicleId);
        } catch (e) {
            Alert.alert('Error', 'Failed to set active vehicle');
        }
    };

    const handleDelete = (vehicle: Vehicle) => {
        Alert.alert(
            'Delete Vehicle',
            `Are you sure you want to delete ${vehicle.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteVehicle(vehicle.id);
                            await loadVehicles();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete vehicle');
                        }
                    }
                }
            ]
        );
    };

    const renderVehicle = ({ item }: { item: Vehicle }) => {
        const isActive = item.id === activeVehicleId;

        return (
            <TouchableOpacity
                style={[styles.vehicleCard, isActive && styles.activeCard]}
                onPress={() => handleSetActive(item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.vehicleContent}>
                    {item.photoUri ? (
                        <Image source={{ uri: item.photoUri }} style={styles.vehiclePhoto} />
                    ) : (
                        <View style={[styles.vehiclePhoto, styles.placeholderPhoto]}>
                            <Ionicons name="car" size={32} color="#ccc" />
                        </View>
                    )}

                    <View style={styles.vehicleInfo}>
                        <Text style={styles.vehicleName}>{item.name}</Text>
                        <Text style={styles.plateNumber}>{item.plateNumber}</Text>
                        {isActive && (
                            <View style={styles.activeBadge}>
                                <Ionicons name="checkmark-circle" size={14} color="#00C853" />
                                <Text style={styles.activeText}>Active</Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={() => handleDelete(item)}
                        style={styles.deleteButton}
                    >
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#001A33', '#003366']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Vehicles</Text>
            </LinearGradient>

            {vehicles.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="car-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No vehicles added yet</Text>
                    <Text style={styles.emptySubtext}>Add your first vehicle to get started</Text>
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={styles.listContent}
                    data={vehicles}
                    keyExtractor={item => item.id}
                    renderItem={renderVehicle}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddVehicle')}
            >
                <LinearGradient
                    colors={['#00C853', '#00A843']}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={28} color="white" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    vehicleCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 15,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeCard: {
        borderColor: '#00C853',
    },
    vehicleContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vehiclePhoto: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 15,
    },
    placeholderPhoto: {
        backgroundColor: '#F0F4F8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    vehicleInfo: {
        flex: 1,
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    plateNumber: {
        fontSize: 14,
        color: '#666',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 4,
    },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    activeText: {
        fontSize: 12,
        color: '#00C853',
        fontWeight: '600',
        marginLeft: 4,
    },
    deleteButton: {
        padding: 8,
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
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
