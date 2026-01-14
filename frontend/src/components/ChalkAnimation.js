/**
 * ChalkAnimation - Animated Chalk Writing Component
 * Displays solution steps with animated chalk-writing effect
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, ANIMATION } from '../styles/theme';

const ChalkLine = ({ text, index, isPlaying, speed }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        if (!isPlaying) return;

        const delay = index * (ANIMATION.chalkLineDelay / speed);

        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 8,
                    tension: 50,
                    useNativeDriver: true,
                }),
            ]).start();
        }, delay);

        return () => clearTimeout(timer);
    }, [isPlaying, speed]);

    return (
        <Animated.View
            style={[
                styles.lineContainer,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.chalkText}>{text}</Text>
        </Animated.View>
    );
};

const ChalkAnimation = ({
    steps = [],
    isPlaying = true,
    speed = 1,
    onComplete
}) => {
    const [completedSteps, setCompletedSteps] = useState(0);

    useEffect(() => {
        if (!isPlaying) return;

        const totalDuration = steps.length * (ANIMATION.chalkLineDelay / speed);

        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, totalDuration);

        return () => clearTimeout(timer);
    }, [isPlaying, steps.length, speed]);

    if (!steps || steps.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.noStepsText}>No steps available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.blackboard}>
                {steps.map((step, index) => (
                    <ChalkLine
                        key={index}
                        text={step}
                        index={index}
                        isPlaying={isPlaying}
                        speed={speed}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    blackboard: {
        backgroundColor: COLORS.blackboardTexture,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    lineContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
        gap: 12,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        color: COLORS.chalkGreen,
        fontSize: 14,
        fontWeight: '600',
    },
    chalkText: {
        flex: 1,
        color: COLORS.chalkWhite,
        fontSize: 16,
        lineHeight: 24,
        letterSpacing: 0.3,
    },
    noStepsText: {
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: 'center',
        padding: 20,
    },
});

export default ChalkAnimation;
