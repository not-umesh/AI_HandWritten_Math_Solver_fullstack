import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../styles/theme';

const GlassCard = ({ children, style, variant = 'default' }) => {
    const getGradientColors = () => {
        switch (variant) {
            case 'success':
                return [COLORS.success + '20', COLORS.success + '10'];
            case 'error':
                return [COLORS.error + '20', COLORS.error + '10'];
            case 'primary':
                return [COLORS.primary + '20', COLORS.primary + '10'];
            default:
                return ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'];
        }
    };

    return (
        <View style={[styles.container, style]}>
            <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Top highlight */}
                <View style={styles.highlight} />

                {/* Content */}
                <View style={styles.content}>
                    {children}
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    gradient: {
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        borderRadius: 20,
        overflow: 'hidden',
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '30%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    content: {
        padding: 20,
    },
});

export default GlassCard;