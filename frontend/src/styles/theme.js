export const COLORS = {
    // Blackboard Gradient backgrounds
    gradientStart: '#1E1E1E',
    gradientMiddle: '#2B2B2B',
    gradientEnd: '#1A1A1A',

    // Blackboard theme
    blackboard: '#1E1E1E',
    blackboardTexture: '#252525',
    blackboardDark: '#151515',

    // Glass effect colors
    glassBackground: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    glassHighlight: 'rgba(255, 255, 255, 0.2)',

    // Chalk colors (primary palette)
    chalkGreen: '#4ADE80',
    chalkWhite: '#F8FAFC',
    chalkYellow: '#FCD34D',
    chalkPink: '#F472B6',
    chalkBlue: '#60A5FA',

    // Accent colors (updated to chalk theme)
    primary: '#4ADE80',       // Neon Green (Chalk)
    primaryGlow: '#4ADE8060',
    secondary: '#60A5FA',     // Chalk Blue
    secondaryGlow: '#60A5FA60',
    accent: '#FCD34D',        // Pastel Yellow
    accentGlow: '#FCD34D60',
    success: '#4ADE80',       // Chalk Green
    successGlow: '#4ADE8060',
    error: '#F87171',         // Soft Red
    errorGlow: '#F8717160',
    warning: '#FBBF24',       // Amber warning

    // Text colors
    textPrimary: '#F8FAFC',
    textSecondary: 'rgba(248, 250, 252, 0.7)',
    textMuted: 'rgba(248, 250, 252, 0.5)',

    // Cyber/Graph theme
    graphBackground: '#0F172A',
    graphGrid: 'rgba(100, 116, 139, 0.3)',
    graphLine: '#EC4899',     // Neon pink for graph lines
    graphLineAlt: '#06B6D4',  // Cyan alternative

    // Trap Alert colors
    trapBorder: '#F97316',
    trapBackground: 'rgba(249, 115, 22, 0.15)',

    // Other
    white: '#ffffff',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.6)',
};

// Animation timing constants
export const ANIMATION = {
    chalkLineDelay: 1200,     // 1.2s per line
    chalkLineDuration: 1500,  // 1.5s max
    fadeInDuration: 600,
    springFriction: 8,
    springTension: 40,
};

export const SHADOWS = {
    glow: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    chalkGlow: {
        shadowColor: COLORS.chalkGreen,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        elevation: 8,
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
    // Chalk handwriting style
    chalk: {
        fontSize: 20,
        fontWeight: '400',
        color: COLORS.chalkWhite,
        letterSpacing: 0.5,
    },
    chalkLarge: {
        fontSize: 28,
        fontWeight: '600',
        color: COLORS.chalkYellow,
    },
};

// Topic folder colors for history
export const TOPIC_COLORS = {
    'Algebra': '#60A5FA',
    'Calculus': '#F472B6',
    'Trigonometry': '#4ADE80',
    'Geometry': '#FBBF24',
    'Arithmetic': '#A78BFA',
    'Statistics': '#34D399',
    'Matrices': '#F87171',
    'Other': '#94A3B8',
};