import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../styles/theme';

const GlassButton = ({
    title,
    onPress,
    icon,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
}) => {
    const [scaleAnim] = React.useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const getVariantColors = () => {
        switch (variant) {
            case 'primary':
                return [COLORS.primary + '40', COLORS.primary + '20'];
            case 'secondary':
                return [COLORS.secondary + '40', COLORS.secondary + '20'];
            case 'accent':
                return [COLORS.accent + '40', COLORS.accent + '20'];
            case 'success':
                return [COLORS.success + '40', COLORS.success + '20'];
            default:
                return [COLORS.glassBackground, COLORS.glassBackground];
        }
    };

    const getGlowColor = () => {
        switch (variant) {
            case 'primary':
                return COLORS.primaryGlow;
            case 'secondary':
                return COLORS.secondaryGlow;
            case 'accent':
                return COLORS.accentGlow;
            case 'success':
                return COLORS.successGlow;
            default:
                return 'transparent';
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return { paddingVertical: 10, paddingHorizontal: 20 };
            case 'large':
                return { paddingVertical: 20, paddingHorizontal: 40 };
            default:
                return { paddingVertical: 15, paddingHorizontal: 30 };
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ scale: scaleAnim }] },
                disabled && styles.disabled,
                style,
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={0.8}
                style={styles.touchable}
            >
                {/* Glow effect */}
                <View
                    style={[
                        styles.glow,
                        { backgroundColor: getGlowColor() },
                    ]}
                />

                {/* Glass background */}
                <LinearGradient
                    colors={getVariantColors()}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.gradient, getSizeStyles()]}
                >
                    {/* Glass border highlight */}
                    <View style={styles.borderHighlight} />

                    {/* Content */}
                    <View style={styles.content}>
                        {loading ? (
                            <Text style={styles.loadingText}>...</Text>
                        ) : (
                            <>
                                {icon && (
                                    <Ionicons
                                        name={icon}
                                        size={size === 'small' ? 18 : 24}
                                        color={COLORS.white}
                                        style={styles.icon}
                                    />
                                )}
                                <Text style={[styles.text, size === 'small' && styles.smallText]}>
                                    {title}
                                </Text>
                            </>
                        )}
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'visible',
    },
    touchable: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    glow: {
        position: 'absolute',
        top: -10,
        left: -10,
        right: -10,
        bottom: -10,
        borderRadius: 26,
        opacity: 0.5,
    },
    gradient: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        overflow: 'hidden',
    },
    borderHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: COLORS.glassHighlight,
        opacity: 0.1,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: 10,
    },
    text: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    smallText: {
        fontSize: 14,
    },
    loadingText: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
    disabled: {
        opacity: 0.5,
    },
});

export default GlassButton;