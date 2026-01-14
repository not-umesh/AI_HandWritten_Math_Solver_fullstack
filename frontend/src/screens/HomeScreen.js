import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';
import GlassButton from '../components/GlassButton';
import GlassCard from '../components/GlassCard';
import LoadingOverlay from '../components/LoadingOverlay';
import { solveTextEquation, healthCheck } from '../services/api';

const HomeScreen = ({ navigation }) => {
    const [textEquation, setTextEquation] = useState('');
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState('checking');
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        checkServerStatus();
    }, []);

    const checkServerStatus = async () => {
        try {
            await healthCheck();
            setServerStatus('online');
        } catch (error) {
            setServerStatus('offline');
        }
    };

    const handleSolveText = async () => {
        if (!textEquation.trim()) return;

        setLoading(true);
        try {
            const result = await solveTextEquation(textEquation);
            navigation.navigate('Result', { result });
        } catch (error) {
            alert('Error solving equation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.chalkBlue]}
                                    style={styles.logoGradient}
                                >
                                    <Ionicons name="calculator" size={40} color={COLORS.white} />
                                </LinearGradient>
                            </View>
                            <Text style={styles.title}>AI Math Solver</Text>
                            <Text style={styles.subtitle}>
                                Solve handwritten equations instantly
                            </Text>

                            {/* Status badges row */}
                            <View style={styles.statusRow}>
                                {/* Offline Ready Badge */}
                                <View style={styles.offlineBadge}>
                                    <Ionicons name="shield-checkmark" size={14} color={COLORS.chalkGreen} />
                                    <Text style={styles.offlineBadgeText}>⚡ Offline Ready</Text>
                                </View>

                                {/* Server status */}
                                <View style={styles.statusContainer}>
                                    <View
                                        style={[
                                            styles.statusDot,
                                            {
                                                backgroundColor:
                                                    serverStatus === 'online'
                                                        ? COLORS.success
                                                        : serverStatus === 'offline'
                                                            ? COLORS.error
                                                            : COLORS.accent,
                                            },
                                        ]}
                                    />
                                    <Text style={styles.statusText}>
                                        Server: {serverStatus}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Main action buttons */}
                        <View style={styles.actionButtons}>
                            <GlassButton
                                title="📷 Scan Equation"
                                icon="camera"
                                variant="primary"
                                size="large"
                                onPress={() => navigation.navigate('Camera')}
                                style={styles.mainButton}
                            />

                            <GlassButton
                                title="🖼️ Pick from Gallery"
                                icon="images"
                                variant="secondary"
                                size="large"
                                onPress={() => navigation.navigate('Camera', { pickFromGallery: true })}
                                style={styles.mainButton}
                            />
                        </View>

                        {/* Tools Row */}
                        <View style={styles.toolsRow}>
                            <TouchableOpacity
                                style={styles.toolButton}
                                onPress={() => navigation.navigate('Graph')}
                            >
                                <LinearGradient
                                    colors={['rgba(236, 72, 153, 0.2)', 'rgba(236, 72, 153, 0.1)']}
                                    style={styles.toolButtonGradient}
                                >
                                    <Ionicons name="analytics" size={24} color="#EC4899" />
                                    <Text style={styles.toolButtonText}>Graph Plotter</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.toolButton}
                                onPress={() => navigation.navigate('History')}
                            >
                                <LinearGradient
                                    colors={['rgba(96, 165, 250, 0.2)', 'rgba(96, 165, 250, 0.1)']}
                                    style={styles.toolButtonGradient}
                                >
                                    <Ionicons name="folder-open" size={24} color="#60A5FA" />
                                    <Text style={styles.toolButtonText}>History</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Text input section */}
                        <GlassCard style={styles.inputCard}>
                            <Text style={styles.inputLabel}>Or type your equation:</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g., 2x + 5 = 15"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={textEquation}
                                    onChangeText={setTextEquation}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    style={styles.sendButton}
                                    onPress={handleSolveText}
                                    disabled={!textEquation.trim()}
                                >
                                    <LinearGradient
                                        colors={[COLORS.primary, COLORS.chalkBlue]}
                                        style={styles.sendButtonGradient}
                                    >
                                        <Ionicons name="send" size={20} color={COLORS.white} />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </GlassCard>

                        {/* Features */}
                        <View style={styles.features}>
                            <Text style={styles.featuresTitle}>✨ Premium Features</Text>
                            <View style={styles.featuresList}>
                                <FeatureItem icon="scan" text="AI-powered handwriting recognition" />
                                <FeatureItem icon="brush" text="Chalk animation replay" />
                                <FeatureItem icon="school" text="8th/10th/12th grade explanations" />
                                <FeatureItem icon="analytics" text="Interactive graph plotter" />
                                <FeatureItem icon="folder-open" text="Auto-organized history" />
                                <FeatureItem icon="warning" text="Common mistake detector" />
                                <FeatureItem icon="image" text="Export as blackboard image" />
                            </View>
                        </View>

                        {/* About / Credits - // Built with {} by UV */}
                        <View style={styles.credits}>
                            <Text style={styles.creditsSlogan}>
                                {'{ built_with_caffeine: true }'}
                            </Text>
                            <Text style={styles.creditsNames}>
                                UV — Umesh & Vijay
                            </Text>
                            <Text style={styles.creditsCopyright}>
                                © 2026 • v2.0.0
                            </Text>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            <LoadingOverlay visible={loading} message="Solving equation..." />
        </LinearGradient>
    );
};

const FeatureItem = ({ icon, text }) => (
    <View style={styles.featureItem}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 60,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 20,
    },
    logoGradient: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: COLORS.white,
        textShadowColor: COLORS.primaryGlow,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginTop: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        gap: 10,
    },
    offlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(74, 222, 128, 0.15)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.3)',
        gap: 6,
    },
    offlineBadgeText: {
        color: COLORS.chalkGreen,
        fontSize: 12,
        fontWeight: '600',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textTransform: 'capitalize',
    },
    actionButtons: {
        gap: 15,
        marginBottom: 30,
    },
    mainButton: {
        width: '100%',
    },
    inputCard: {
        marginBottom: 30,
    },
    inputLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    textInput: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: COLORS.white,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    sendButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    sendButtonGradient: {
        padding: 14,
        borderRadius: 12,
    },
    features: {
        marginTop: 20,
    },
    featuresTitle: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 15,
    },
    featuresList: {
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    featureText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    credits: {
        marginTop: 40,
        alignItems: 'center',
        paddingBottom: 20,
    },
    creditsText: {
        color: COLORS.textMuted,
        fontSize: 12,
        fontStyle: 'italic',
    },
    creditsNames: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
        letterSpacing: 0.5,
    },
    creditsCopyright: {
        color: COLORS.textMuted,
        fontSize: 11,
        marginTop: 6,
        opacity: 0.7,
    },
    creditsSlogan: {
        color: COLORS.chalkGreen,
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginBottom: 4,
        opacity: 0.8,
    },
    toolsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    toolButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    toolButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    toolButtonText: {
        color: COLORS.textPrimary,
        fontSize: 14,
        fontWeight: '500',
    },
});

export default HomeScreen;