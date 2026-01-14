/**
 * TrapAlertCard - Common Mistake Warning Component
 * Shows collapsible warning cards for common student mistakes
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';

const TrapAlertCard = ({ mistake }) => {
    const [expanded, setExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const toggleExpand = () => {
        Animated.timing(animation, {
            toValue: expanded ? 0 : 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
        setExpanded(!expanded);
    };

    const contentHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 150],
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.header} onPress={toggleExpand}>
                <View style={styles.headerLeft}>
                    <Ionicons name="warning" size={20} color={COLORS.trapBorder} />
                    <Text style={styles.headerText}>
                        ⚠️ Trap Alert: 95% of students fail here
                    </Text>
                </View>
                <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={COLORS.textSecondary}
                />
            </TouchableOpacity>

            <Animated.View style={[styles.content, { maxHeight: contentHeight }]}>
                <View style={styles.comparisonContainer}>
                    {/* Wrong Approach */}
                    <View style={styles.wrongBox}>
                        <View style={styles.boxHeader}>
                            <Ionicons name="close-circle" size={18} color={COLORS.error} />
                            <Text style={styles.boxTitle}>Wrong</Text>
                        </View>
                        <Text style={styles.boxText}>{mistake.wrong_approach}</Text>
                    </View>

                    {/* Correct Approach */}
                    <View style={styles.correctBox}>
                        <View style={styles.boxHeader}>
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                            <Text style={styles.boxTitle}>Correct</Text>
                        </View>
                        <Text style={styles.boxText}>{mistake.correct_approach}</Text>
                    </View>
                </View>

                {/* Tip */}
                <View style={styles.tipContainer}>
                    <Ionicons name="bulb" size={16} color={COLORS.accent} />
                    <Text style={styles.tipText}>{mistake.tip}</Text>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.trapBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.trapBorder,
        marginVertical: 10,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    headerText: {
        color: COLORS.trapBorder,
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    content: {
        overflow: 'hidden',
        paddingHorizontal: 14,
    },
    comparisonContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    wrongBox: {
        flex: 1,
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgba(248, 113, 113, 0.3)',
    },
    correctBox: {
        flex: 1,
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.3)',
    },
    boxHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    boxTitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    boxText: {
        color: COLORS.textPrimary,
        fontSize: 12,
        lineHeight: 18,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: 'rgba(252, 211, 77, 0.1)',
        borderRadius: 8,
        padding: 10,
        marginBottom: 14,
    },
    tipText: {
        color: COLORS.accent,
        fontSize: 12,
        flex: 1,
        lineHeight: 18,
    },
});

export default TrapAlertCard;
