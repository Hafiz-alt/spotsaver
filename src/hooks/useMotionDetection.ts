import { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import { Platform } from 'react-native';

// Sensitivity thresholds
const MOVE_THRESHOLD = 0.15; // g-force variance
const STILL_DURATION = 5000; // ms to be considered "parked" for demo purposes

export const useMotionDetection = () => {
    const [data, setData] = useState({ x: 0, y: 0, z: 0 });
    const [isLikelyParked, setIsLikelyParked] = useState(false);
    const [lastMoveTime, setLastMoveTime] = useState(Date.now());

    console.log('[DEBUG] useMotionDetection hook initialized, isLikelyParked:', isLikelyParked);

    useEffect(() => {
        if (Platform.OS === 'web') {
            console.log('[DEBUG] Motion detection disabled on web');
            return;
        }

        console.log('[DEBUG] Setting up accelerometer listener');
        Accelerometer.setUpdateInterval(500); // Check every 500ms

        const subscription = Accelerometer.addListener(accelerometerData => {
            setData(accelerometerData);

            // Simple variance check (approximate magnitude delta)
            const magnitude = Math.sqrt(
                accelerometerData.x ** 2 +
                accelerometerData.y ** 2 +
                accelerometerData.z ** 2
            );

            // 1g is standard gravity. Deviation implies movement.
            // We look for stability (near 1g or consistent value)
            // Actually simpler: just check delta from previous? 
            // For this demo, we'll reset "lastMoveTime" if deviation from 1g is high
            // OR if the device is rotating/moving significantly.

            // Let's rely on variance from 1.0 (stationary flat) or just high delta.
            // "Parked" means engine off, user stationary.

            const delta = Math.abs(magnitude - 1);

            if (delta > MOVE_THRESHOLD) {
                setLastMoveTime(Date.now());
                if (isLikelyParked) {
                    console.log('[DEBUG] Motion detected, resetting parked state. Delta:', delta);
                    setIsLikelyParked(false);
                }
            } else {
                const timeSinceMove = Date.now() - lastMoveTime;
                if (timeSinceMove > STILL_DURATION && !isLikelyParked) {
                    console.log('[DEBUG] Device still for', timeSinceMove, 'ms, setting isLikelyParked=true');
                    setIsLikelyParked(true);
                }
            }
        });

        return () => subscription && subscription.remove();
    }, [lastMoveTime]);

    return { isLikelyParked, debugData: data };
};
