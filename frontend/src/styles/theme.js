export const COLORS = {
    // Gradient backgrounds
    gradientStart: '#0f0c29',
    gradientMiddle: '#302b63',
    gradientEnd: '#24243e',

    // Glass effect colors
    glassBackground: 'rgba(255, 255, 255, 0.1)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glassHighlight: 'rgba(255, 255, 255, 0.3)',

    // Accent colors
    primary: '#00d4ff',
    primaryGlow: '#00d4ff80',
    secondary: '#7c3aed',
    secondaryGlow: '#7c3aed80',
    accent: '#f59e0b',
    accentGlow: '#f59e0b80',
    success: '#10b981',
    successGlow: '#10b98180',
    error: '#ef4444',
    errorGlow: '#ef444480',

    // Text colors
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.5)',

    // Other
    white: '#ffffff',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
};

export const SHADOWS = {
    glow: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
};

export const FONTS = {
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    body: {
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    caption: {
        fontSize: 14,
        color: COLORS.textMuted,
    },
};