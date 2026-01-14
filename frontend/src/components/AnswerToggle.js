/**
 * AnswerToggle - Show Only Answer vs Full Solution
 * Spoiler-style interaction with accordion reveal
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../styles/theme';

const AnswerToggle = ({ answer, children, initiallyExpanded = false }) => {
    const [expanded, setExpanded] = useState(initiallyExpanded);
    const animatedHeight = useRef(new Animated.Value(initiallyExpanded ? 1 : 0)).current;
    const rotateAnim = useRef(new Animated.Value(initiallyExpanded ? 1 : 0)).current;

    const toggleExpand = () => {
        Animated.parallel([
            Animated.spring(animatedHeight, {
                toValue: expanded ? 0 : 1,
                friction: 8,
                tension: 50,
                useNativeDriver: false,
            }),
            Animated.timing(rotateAnim, {
                toValue: expanded ? 0 : 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
        setExpanded(!expanded);
    };

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <View style={styles.container}>
            {/* Big Answer Display */}
            <View style={styles.answerContainer}>
                <Text style={styles.answerLabel}>✅ Answer</Text>
                <Text style={styles.answerText}>{answer}</Text>
            </View>

            {/* Toggle Button */}
            <TouchableOpacity style={styles.toggleButton} onPress={toggleExpand}>
                <LinearGradient
                    colors={[
                        expanded ? 'rgba(74, 222, 128, 0.2)' : COLORS.glassBackground,
                        expanded ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)',
                    ]}
                    style={styles.toggleGradient}
                >
                    <Text style={styles.toggleText}>
                        {expanded ? 'Hide Steps' : 'Show Steps & Logic'}
                    </Text>
                    <Animated.View style={{ transform: [{ rotate }] }}>
                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color={COLORS.primary}
                        />
                    </Animated.View>
                </LinearGradient>
            </TouchableOpacity>

            {/* Collapsible Content */}
            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        opacity: animatedHeight,
                        maxHeight: animatedHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 2000],
                        }),
                    },
                ]}
            >
                <View style={styles.content}>{children}</View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    answerContainer: {
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.3)',
        marginBottom: 15,
    },
    answerLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 10,
    },
    answerText: {
        color: COLORS.chalkYellow,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'rgba(252, 211, 77, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    toggleButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 15,
    },
    toggleGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        borderRadius: 12,
    },
    toggleText: {
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: '600',
    },
    contentContainer: {
        overflow: 'hidden',
    },
    content: {
        paddingTop: 5,
    },
});

export default AnswerToggle;
