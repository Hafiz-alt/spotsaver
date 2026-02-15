import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spot } from '../models/Spot';
import { Vehicle } from '../models/Vehicle';

const KEYS = {
    LAST_SPOT: 'memory_parking_last_spot',
    HISTORY: 'memory_parking_history',
    VEHICLES: 'memory_parking_vehicles',
    ACTIVE_VEHICLE: 'memory_parking_active_vehicle',
    MIGRATION_VERSION: 'memory_parking_migration_version',
};

const CURRENT_MIGRATION_VERSION = 1;

/**
 * Migrate storage data to handle schema changes
 * Version 1: Add vehicleId field to existing spots
 */
export const migrateStorage = async (): Promise<void> => {
    try {
        const versionStr = await AsyncStorage.getItem(KEYS.MIGRATION_VERSION);
        const currentVersion = versionStr ? parseInt(versionStr, 10) : 0;

        if (currentVersion >= CURRENT_MIGRATION_VERSION) {
            return; // Already migrated
        }

        console.log(`Migrating storage from version ${currentVersion} to ${CURRENT_MIGRATION_VERSION}`);

        // Migration 1: Add vehicleId to spots
        if (currentVersion < 1) {
            const lastSpotStr = await AsyncStorage.getItem(KEYS.LAST_SPOT);
            if (lastSpotStr) {
                const lastSpot = JSON.parse(lastSpotStr);
                if (!lastSpot.vehicleId) {
                    lastSpot.vehicleId = null;
                    await AsyncStorage.setItem(KEYS.LAST_SPOT, JSON.stringify(lastSpot));
                }
            }

            const historyStr = await AsyncStorage.getItem(KEYS.HISTORY);
            if (historyStr) {
                const history: Spot[] = JSON.parse(historyStr);
                const migratedHistory = history.map(spot => ({
                    ...spot,
                    vehicleId: spot.vehicleId || null
                }));
                await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(migratedHistory));
            }
        }

        // Save new migration version
        await AsyncStorage.setItem(KEYS.MIGRATION_VERSION, CURRENT_MIGRATION_VERSION.toString());
        console.log('Storage migration complete');
    } catch (error) {
        console.error('Storage migration failed:', error);
        // Don't throw - allow app to continue even if migration fails
    }
};

export const saveSpot = async (spot: Spot): Promise<void> => {
    try {
        // Retrieve history first
        const historyString = await AsyncStorage.getItem(KEYS.HISTORY);
        const history: Spot[] = historyString ? JSON.parse(historyString) : [];
        console.log('[DEBUG] Current history length:', history.length);

        // Prepare new history
        const newHistory = [spot, ...history];

        // Batch save both last spot and history in a single operation
        await AsyncStorage.multiSet([
            [KEYS.LAST_SPOT, JSON.stringify(spot)],
            [KEYS.HISTORY, JSON.stringify(newHistory)]
        ]);

        console.log('[DEBUG] Saved last spot:', spot.id);
        console.log('[DEBUG] New history length after save:', newHistory.length);
    } catch (e) {
        console.error('Error saving spot:', e);
        throw e;
    }
};

export const getLastSpot = async (): Promise<Spot | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(KEYS.LAST_SPOT);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Error getting last spot:', e);
        return null;
    }
};

export const getAllSpots = async (): Promise<Spot[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(KEYS.HISTORY);
        const spots = jsonValue != null ? JSON.parse(jsonValue) : [];
        console.log('[DEBUG] getAllSpots returned:', spots.length, 'spots');
        if (spots.length > 0) {
            console.log('[DEBUG] First spot:', spots[0]);
        }
        return spots;
    } catch (e) {
        console.error('Error getting all spots:', e);
        return [];
    }
};

export const clearAllSpots = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([KEYS.LAST_SPOT, KEYS.HISTORY]);
    } catch (e) {
        console.error("Error clearing spots", e);
    }
}

// ========== VEHICLE MANAGEMENT ==========

export const saveVehicle = async (vehicle: Vehicle): Promise<void> => {
    try {
        const vehicles = await getVehicles();
        const existingIndex = vehicles.findIndex(v => v.id === vehicle.id);

        if (existingIndex >= 0) {
            vehicles[existingIndex] = vehicle;
        } else {
            vehicles.push(vehicle);
        }

        await AsyncStorage.setItem(KEYS.VEHICLES, JSON.stringify(vehicles));

        // If this is the first vehicle or marked as default, set as active
        if (vehicles.length === 1 || vehicle.isDefault) {
            await setActiveVehicle(vehicle.id);
        }
    } catch (e) {
        console.error('Error saving vehicle:', e);
        throw e;
    }
};

export const getVehicles = async (): Promise<Vehicle[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(KEYS.VEHICLES);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Error getting vehicles:', e);
        return [];
    }
};

export const deleteVehicle = async (id: string): Promise<void> => {
    try {
        const vehicles = await getVehicles();
        const filtered = vehicles.filter(v => v.id !== id);
        await AsyncStorage.setItem(KEYS.VEHICLES, JSON.stringify(filtered));

        // If deleted vehicle was active, set first vehicle as active
        const activeId = await getActiveVehicle();
        if (activeId === id && filtered.length > 0) {
            await setActiveVehicle(filtered[0].id);
        } else if (filtered.length === 0) {
            await AsyncStorage.removeItem(KEYS.ACTIVE_VEHICLE);
        }
    } catch (e) {
        console.error('Error deleting vehicle:', e);
        throw e;
    }
};

export const getActiveVehicle = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(KEYS.ACTIVE_VEHICLE);
    } catch (e) {
        console.error('Error getting active vehicle:', e);
        return null;
    }
};

export const setActiveVehicle = async (vehicleId: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(KEYS.ACTIVE_VEHICLE, vehicleId);
    } catch (e) {
        console.error('Error setting active vehicle:', e);
        throw e;
    }
};
