import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spot } from '../models/Spot';

const KEYS = {
    LAST_SPOT: 'memory_parking_last_spot',
    HISTORY: 'memory_parking_history',
};

export const saveSpot = async (spot: Spot): Promise<void> => {
    try {
        // 1. Save as last spot
        const jsonValue = JSON.stringify(spot);
        await AsyncStorage.setItem(KEYS.LAST_SPOT, jsonValue);

        // 2. Append to history (retrieve, prepend, save)
        const historyString = await AsyncStorage.getItem(KEYS.HISTORY);
        const history: Spot[] = historyString ? JSON.parse(historyString) : [];

        const newHistory = [spot, ...history];
        await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(newHistory));
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
        return jsonValue != null ? JSON.parse(jsonValue) : [];
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
