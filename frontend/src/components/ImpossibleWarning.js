/**
 * ImpossibleWarning - Warning for Impossible Questions
 * Amber toast-style warning with "Why?" explanation button
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

const ImpossibleWarning = ({ reason, suggestion, onDismiss }) => {
    const [showExplanation, setShowExplanation] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons name="alert-circle" size={28} color={COLORS.warning} />
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Mathematically Impossible 🛑</Text>
                    <Text style={styles.subtitle}>
                        {suggestion || 'Did you copy the question correctly?'}
                    </Text>
                </View>
            </View>

            {/* Why Button */}
            <TouchableOpacity
                style={styles.whyButton}
                onPress={() => setShowExplanation(!showExplanation)}
            >
                <Text style={styles.whyButtonText}>
                    {showExplanation ? 'Hide' : 'Why?'}
                </Text>
                <Ionicons
                    name={showExplanation ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={COLORS.warning}
                />
            </TouchableOpacity>

            {/* Explanation */}
            {showExplanation && (
                <View style={styles.explanationContainer}>
                    <Text style={styles.explanationText}>{reason}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(251, 191, 36, 0.12)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
        marginVertical: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        color: COLORS.warning,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        lineHeight: 20,
    },
    whyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 14,
        paddingVertical: 10,
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        borderRadius: 10,
    },
    whyButtonText: {
        color: COLORS.warning,
        fontSize: 14,
        fontWeight: '600',
    },
    explanationContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 10,
    },
    explanationText: {
        color: COLORS.textPrimary,
        fontSize: 13,
        lineHeight: 20,
    },
});

export default ImpossibleWarning;
