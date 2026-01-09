import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Share,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';
import GlassButton from '../components/GlassButton';
import GlassCard from '../components/GlassCard';

const ResultScreen = ({ navigation, route }) => {
    const { result } = route.params;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleShare = async () => {
        try {
            const message = `
🔢 Math Problem Solved!

📝 Equation: ${result.cleaned_equation || result.detected_equation}

✅ Answer: ${result.solution}

📚 Steps:
${result.steps?.map((step, i) => `${i + 1}. ${step}`).join('\n')}

💡 Explanation: ${result.explanation}

Solved by AI Math Solver 🤖
      `.trim();

            await Share.share({ message });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'linear':
                return 'trending-up';
            case 'quadratic':
                return 'analytics';
            case 'arithmetic':
                return 'calculator';
            default:
                return 'school';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'linear':
                return COLORS.primary;
            case 'quadratic':
                return COLORS.secondary;
            case 'arithmetic':
                return COLORS.success;
            case 'error':
                return COLORS.error;
            default:
                return COLORS.accent;
        }
    };

    return (
        <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Solution</Text>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Ionicons name="share-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Success indicator */}
                    <View style={styles.successIcon}>
                        <LinearGradient
                            colors={[COLORS.success, COLORS.primary]}
                            style={styles.successIconGradient}
                        >
                            <Ionicons name="checkmark" size={40} color={COLORS.white} />
                        </LinearGradient>
                    </View>

                    {/* Equation Type Badge */}
                    <View
                        style={[
                            styles.typeBadge,
                            { backgroundColor: getTypeColor(result.equation_type) + '30' },
                        ]}
                    >
                        <Ionicons
                            name={getTypeIcon(result.equation_type)}
                            size={16}
                            color={getTypeColor(result.equation_type)}
                        />
                        <Text
                            style={[
                                styles.typeText,
                                { color: getTypeColor(result.equation_type) },
                            ]}
                        >
                            {result.equation_type?.replace('_', ' ').toUpperCase() || 'EQUATION'}
                        </Text>
                    </View>

                    {/* Detected Equation */}
                    <GlassCard style={styles.equationCard}>
                        <Text style={styles.cardLabel}>📝 Detected Equation</Text>
                        <Text style={styles.equationText}>
                            {result.cleaned_equation || result.detected_equation}
                        </Text>
                        {result.ocr_method && (
                            <Text style={styles.ocrMethod}>
                                Recognized using: {result.ocr_method.toUpperCase()}
                            </Text>
                        )}
                    </GlassCard>

                    {/* Answer */}
                    <GlassCard style={styles.answerCard} variant="success">
                        <Text style={styles.cardLabel}>✅ Answer</Text>
                        <Text style={styles.answerText}>{result.solution}</Text>
                    </GlassCard>

                    {/* Steps */}
                    {result.steps && result.steps.length > 0 && (
                        <GlassCard style={styles.stepsCard}>
                            <Text style={styles.cardLabel}>📚 Step-by-Step Solution</Text>
                            <View style={styles.stepsList}>
                                {result.steps.map((step, index) => (
                                    <StepItem key={index} step={step} index={index} />
                                ))}
                            </View>
                        </GlassCard>
                    )}

                    {/* Explanation */}
                    {result.explanation && (
                        <GlassCard style={styles.explanationCard} variant="primary">
                            <Text style={styles.cardLabel}>💡 Explanation</Text>
                            <Text style={styles.explanationText}>{result.explanation}</Text>
                        </GlassCard>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <GlassButton
                            title="Solve Another"
                            icon="camera"
                            variant="primary"
                            onPress={() => navigation.navigate('Camera')}
                            style={styles.actionButton}
                        />
                        <GlassButton
                            title="Home"
                            icon="home"
                            variant="secondary"
                            onPress={() => navigation.navigate('Home')}
                            style={styles.actionButton}
                        />
                    </View>
                </Animated.View>
            </ScrollView>
        </LinearGradient>
    );
};

const StepItem = ({ step, index }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            delay: index * 100,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.stepItem, { opacity: fadeAnim }]}>
            <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: '600',
    },
    shareButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    content: {
        alignItems: 'center',
    },
    successIcon: {
        marginBottom: 20,
    },
    successIconGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 25,
        gap: 8,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    equationCard: {
        width: '100%',
        marginBottom: 15,
    },
    answerCard: {
        width: '100%',
        marginBottom: 15,
    },
    stepsCard: {
        width: '100%',
        marginBottom: 15,
    },
    explanationCard: {
        width: '100%',
        marginBottom: 25,
    },
    cardLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 10,
    },
    equationText: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
    },
    ocrMethod: {
        color: COLORS.textMuted,
        fontSize: 12,
        marginTop: 10,
        textAlign: 'center',
    },
    answerText: {
        color: COLORS.success,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: COLORS.successGlow,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    stepsList: {
        gap: 12,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary + '30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    stepText: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: 15,
        lineHeight: 22,
    },
    explanationText: {
        color: COLORS.textPrimary,
        fontSize: 15,
        lineHeight: 24,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
    },
    actionButton: {
        flex: 1,
    },
});

export default ResultScreen;