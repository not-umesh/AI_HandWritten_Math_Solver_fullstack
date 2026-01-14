/**
 * ExplanationToggle - Grade-Based Explanation Mode Switcher
 * Segmented toggle with grade levels for different explanation complexity
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

const MODES = [
    { key: 'grade8', label: '8th Grade', emoji: '📚' },
    { key: 'grade10', label: '10th Grade', emoji: '📖' },
    { key: 'grade12', label: '12th/College', emoji: '🎓' },
];

const ExplanationToggle = ({ mode, onModeChange }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Explain like I'm in...</Text>
            <View style={styles.toggleContainer}>
                {MODES.map((item) => (
                    <TouchableOpacity
                        key={item.key}
                        style={[
                            styles.toggleButton,
                            mode === item.key && styles.toggleButtonActive,
                        ]}
                        onPress={() => onModeChange(item.key)}
                    >
                        <Text style={styles.emoji}>{item.emoji}</Text>
                        <Text
                            style={[
                                styles.toggleText,
                                mode === item.key && styles.toggleTextActive,
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginBottom: 10,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.glassBackground,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 10,
        gap: 4,
    },
    toggleButtonActive: {
        backgroundColor: COLORS.primary,
    },
    emoji: {
        fontSize: 18,
    },
    toggleText: {
        color: COLORS.textSecondary,
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
    },
    toggleTextActive: {
        color: COLORS.blackboard,
        fontWeight: '600',
    },
});

export default ExplanationToggle;
