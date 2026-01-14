import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Share,
    Animated,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';
import GlassButton from '../components/GlassButton';
import GlassCard from '../components/GlassCard';
import TrapAlertCard from '../components/TrapAlertCard';
import ExplanationToggle from '../components/ExplanationToggle';
import AnswerToggle from '../components/AnswerToggle';
import ImpossibleWarning from '../components/ImpossibleWarning';
import ChalkAnimation from '../components/ChalkAnimation';

import BlackboardExport from '../components/BlackboardExport';
import { solveTextEquation } from '../services/api';
import { saveSolution } from '../services/historyStorage';

const ResultScreen = ({ navigation, route }) => {
    const { result } = route.params;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;



    // Explanation mode state
    const [explanationMode, setExplanationMode] = useState('grade10');
    const [currentExplanation, setCurrentExplanation] = useState(result.explanation);
    const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

    // Export modal state
    const [showExportModal, setShowExportModal] = useState(false);

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

    // Handle explanation mode change
    const handleExplanationModeChange = async (newMode) => {
        if (newMode === explanationMode) return;

        setExplanationMode(newMode);
        setIsLoadingExplanation(true);

        try {
            // Re-solve with new explanation mode
            const equation = result.cleaned_equation || result.detected_equation || result.original_equation;
            const newResult = await solveTextEquation(equation);

            // For now, use the explanation from the result
            // In production, pass explanation_mode to the API
            setCurrentExplanation(newResult.explanation);
        } catch (error) {
            console.error('Error changing explanation mode:', error);
        } finally {
            setIsLoadingExplanation(false);
        }
    };

    const handleShare = async () => {
        try {
            const message = `
🔢 Math Problem Solved!

📝 Equation: ${result.cleaned_equation || result.detected_equation}

✅ Answer: ${result.solution}

📚 Steps:
${result.steps?.map((step, i) => `${i + 1}. ${step}`).join('\n')}

💡 Explanation: ${currentExplanation}

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
            case 'impossible':
                return 'alert-circle';
            default:
                return 'school';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'linear':
                return COLORS.primary;
            case 'quadratic':
                return COLORS.chalkBlue;
            case 'arithmetic':
                return COLORS.success;
            case 'error':
            case 'impossible':
                return COLORS.warning;
            default:
                return COLORS.accent;
        }
    };

    // Check if result is impossible
    const isImpossible = result.is_impossible;
    const commonMistakes = result.common_mistakes || [];

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
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.headerBtn} onPress={() => setShowExportModal(true)}>
                        <Ionicons name="image" size={22} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
                        <Ionicons name="share-outline" size={22} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
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
                    {/* Impossible Question Warning */}
                    {isImpossible && (
                        <ImpossibleWarning
                            reason={result.impossible_reason}
                            suggestion={result.suggestion}
                        />
                    )}

                    {/* Success indicator (only if not impossible) */}
                    {!isImpossible && (
                        <View style={styles.successIcon}>
                            <LinearGradient
                                colors={[COLORS.success, COLORS.chalkBlue]}
                                style={styles.successIconGradient}
                            >
                                <Ionicons name="checkmark" size={40} color={COLORS.white} />
                            </LinearGradient>
                        </View>
                    )}

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

                    {/* Answer Toggle (Spoiler style) */}
                    <AnswerToggle answer={result.solution} initiallyExpanded={!isImpossible}>
                        {/* Explanation Mode Toggle */}
                        <ExplanationToggle
                            mode={explanationMode}
                            onModeChange={handleExplanationModeChange}
                        />

                        {/* Common Mistake Warnings */}
                        {commonMistakes.map((mistake, index) => (
                            <TrapAlertCard key={index} mistake={mistake} />
                        ))}

                        {/* Steps with Chalk Animation */}
                        {result.steps && result.steps.length > 0 && (
                            <GlassCard style={styles.stepsCard}>
                                <Text style={styles.cardLabel}>📚 Step-by-Step Solution</Text>
                                <ChalkAnimation steps={result.steps} />
                            </GlassCard>
                        )}

                        {/* Explanation */}
                        {currentExplanation && (
                            <GlassCard style={styles.explanationCard} variant="primary">
                                <Text style={styles.cardLabel}>
                                    {explanationMode === 'grade8' ? '📚' :
                                        explanationMode === 'grade10' ? '📖' : '🎓'} Explanation
                                </Text>
                                <Text style={styles.explanationText}>
                                    {isLoadingExplanation ? 'Loading...' : currentExplanation}
                                </Text>
                            </GlassCard>
                        )}
                    </AnswerToggle>

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



            {/* Export Modal */}
            <Modal
                visible={showExportModal}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <BlackboardExport
                    equation={result.cleaned_equation || result.detected_equation}
                    answer={result.solution}
                    steps={result.steps}
                    onClose={() => setShowExportModal(false)}
                />
            </Modal>
        </LinearGradient>
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
    headerButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 180, // Extra space for floating controls
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
    stepsCard: {
        width: '100%',
        marginBottom: 15,
        marginTop: 15,
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
    explanationText: {
        color: COLORS.textPrimary,
        fontSize: 15,
        lineHeight: 24,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
        marginTop: 10,
    },
    actionButton: {
        flex: 1,
    },
});

export default ResultScreen;