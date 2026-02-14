import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        // Ensure this method is implemented to satisfy interface requirements
        // and log errors appropriately.
    }

    resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // If a custom fallback is provided, use it.
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <View style={styles.container}>
                    <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
                    <Text style={styles.title}>Something went wrong</Text>
                    <Text style={styles.message}>
                        {this.state.error ? this.state.error.toString() : "An unexpected error occurred."}
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={this.resetError}>
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF0F0',
        borderRadius: 8,
        minHeight: 150,
        margin: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 10,
    },
    message: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
