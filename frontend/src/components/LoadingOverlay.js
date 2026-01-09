import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../styles/theme';

const LoadingOverlay = ({ visible, message = 'Processing...' }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            // Rotation animation
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();

            // Pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [visible]);

    if (!visible) return null;

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.overlay}>
            <View style={styles.container}>
                {/* Animated spinner */}
                <Animated.View
                    style={[
                        styles.spinner,
                        {
                            transform: [{ rotate: spin }, { scale: pulseAnim }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary, COLORS.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.spinnerGradient}
                    />
                </Animated.View>

                {/* Loading text */}
                <Text style={styles.message}>{message}</Text>

                {/* Animated dots */}
                <View style={styles.dotsContainer}>
                    {[0, 1, 2].map((i) => (
                        <AnimatedDot key={i} delay={i * 200} />
                    ))}
                </View>
            </View>
        </View>
    );
};

const AnimatedDot = ({ delay }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.dot,
                { opacity },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        alignItems: 'center',
        padding: 40,
    },
    spinner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 30,
    },
    spinnerGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'transparent',
    },
    message: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        textAlign: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
});

export default LoadingOverlay;