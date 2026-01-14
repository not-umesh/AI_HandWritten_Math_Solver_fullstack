/**
 * AnimationControls - Floating Control Bar for Animation
 * Play/Pause, Speed toggle, Mute button with glassmorphism design
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS } from '../styles/theme';

const AnimationControls = ({
    isPlaying,
    onPlayPause,
    speed,
    onSpeedChange,
    isMuted,
    onMuteToggle,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.controlsCard}>
                {/* Play/Pause */}
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={onPlayPause}
                >
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={22}
                        color={COLORS.chalkGreen}
                    />
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Speed Toggle */}
                <TouchableOpacity
                    style={[
                        styles.speedButton,
                        speed === 2 && styles.speedButtonActive
                    ]}
                    onPress={() => onSpeedChange(speed === 1 ? 2 : 1)}
                >
                    <Text style={[
                        styles.speedText,
                        speed === 2 && styles.speedTextActive
                    ]}>
                        {speed}x
                    </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Mute Toggle */}
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={onMuteToggle}
                >
                    <Ionicons
                        name={isMuted ? "volume-mute" : "volume-medium"}
                        size={22}
                        color={isMuted ? COLORS.textMuted : COLORS.chalkWhite}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
    },
    controlsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    controlButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: COLORS.glassBorder,
        marginHorizontal: 8,
    },
    speedButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    speedButtonActive: {
        backgroundColor: COLORS.chalkGreen,
    },
    speedText: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    speedTextActive: {
        color: COLORS.blackboard,
    },
});

export default AnimationControls;
