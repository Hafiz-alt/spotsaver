import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SaveButtonProps {
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ onPress, loading = false, disabled = false }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (loading || disabled) return;
        // Light haptic feedback on press
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        if (loading || disabled) return;
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
        onPress();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                testID="save-button"
                disabled={loading || disabled}
            >
                <LinearGradient
                    colors={loading || disabled ? ['#999', '#666'] : ['#007AFF', '#00C853']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButton}
                >
                    {loading ? (
                        <>
                            <ActivityIndicator size="small" color="white" style={{ marginRight: 10 }} />
                            <Text style={styles.text}>SAVING...</Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="location" size={24} color="white" style={{ marginRight: 10 }} />
                            <Text style={styles.text}>SAVE PARKING SPOT</Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    gradientButton: {
        width: 280,
        height: 60,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#00C853',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    text: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
