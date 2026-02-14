import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { saveVehicle } from '../services/storage';
import { Vehicle } from '../models/Vehicle';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export const AddVehicleScreen = () => {
    const [name, setName] = useState('');
    const [plateNumber, setPlateNumber] = useState('');
    const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant photo library access to add vehicle photos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setPhotoUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleTakePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera access to take vehicle photos.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setPhotoUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please enter vehicle name');
            return;
        }

        if (!plateNumber.trim()) {
            Alert.alert('Validation Error', 'Please enter plate number');
            return;
        }

        setLoading(true);
        try {
            const vehicle: Vehicle = {
                id: Date.now().toString() + Math.random().toString(36).substring(7),
                name: name.trim(),
                plateNumber: plateNumber.trim().toUpperCase(),
                photoUri,
                createdAt: new Date().toISOString(),
            };

            await saveVehicle(vehicle);
            Alert.alert('Success', 'Vehicle added successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error saving vehicle:', error);
            Alert.alert('Error', 'Failed to save vehicle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#001A33', '#003366']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Vehicle</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Photo Section */}
                <View style={styles.photoSection}>
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.vehicleImage} />
                    ) : (
                        <View style={[styles.vehicleImage, styles.placeholderImage]}>
                            <Ionicons name="car" size={48} color="#ccc" />
                        </View>
                    )}

                    <View style={styles.photoButtons}>
                        <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                            <Ionicons name="camera" size={20} color="#007AFF" />
                            <Text style={styles.photoButtonText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                            <Ionicons name="images" size={20} color="#007AFF" />
                            <Text style={styles.photoButtonText}>Choose Photo</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vehicle Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Honda City, Toyota Camry"
                            placeholderTextColor="#999"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Plate Number *</Text>
                        <TextInput
                            style={[styles.input, styles.plateInput]}
                            placeholder="e.g., KA-01-AB-1234"
                            placeholderTextColor="#999"
                            value={plateNumber}
                            onChangeText={setPlateNumber}
                            autoCapitalize="characters"
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={styles.saveButtonWrapper}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#00C853', '#00A843']}
                        style={styles.saveButton}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 10 }} />
                        <Text style={styles.saveButtonText}>
                            {loading ? 'Saving...' : 'Save Vehicle'}
                        </Text>
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
    content: {
        padding: 20,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    vehicleImage: {
        width: 150,
        height: 150,
        borderRadius: 16,
        marginBottom: 20,
    },
    placeholderImage: {
        backgroundColor: '#F0F4F8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    photoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    photoButtonText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    formSection: {
        marginBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    plateInput: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButtonWrapper: {
        marginTop: 20,
    },
    saveButton: {
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
    saveButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
});
