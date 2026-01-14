/**
 * BlackboardExport - Export Solution as Aesthetic Image
 * Creates blackboard-styled image with watermark for sharing
 */

import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { COLORS } from '../styles/theme';

const BlackboardExport = ({ equation, answer, steps, onClose }) => {
    const viewShotRef = useRef();
    const [aspectRatio, setAspectRatio] = useState('portrait'); // 'portrait' or 'square'
    const [isSaving, setIsSaving] = useState(false);

    // Export as image
    const handleExport = async () => {
        try {
            setIsSaving(true);

            // Request permission
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please allow access to save images');
                return;
            }

            // Capture the view
            const uri = await viewShotRef.current.capture();

            // Save to gallery
            await MediaLibrary.saveToLibraryAsync(uri);

            Alert.alert(
                'Saved! 🎉',
                'Image saved to your gallery. Share it on Instagram, WhatsApp, or TikTok!',
                [{ text: 'OK', onPress: onClose }]
            );
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to save image');
        } finally {
            setIsSaving(false);
        }
    };

    const containerHeight = aspectRatio === 'portrait' ? 600 : 400;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Export Image</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Aspect Ratio Toggle */}
            <View style={styles.aspectToggle}>
                <TouchableOpacity
                    style={[
                        styles.aspectButton,
                        aspectRatio === 'portrait' && styles.aspectButtonActive,
                    ]}
                    onPress={() => setAspectRatio('portrait')}
                >
                    <Ionicons
                        name="phone-portrait"
                        size={18}
                        color={aspectRatio === 'portrait' ? COLORS.blackboard : COLORS.textSecondary}
                    />
                    <Text
                        style={[
                            styles.aspectText,
                            aspectRatio === 'portrait' && styles.aspectTextActive,
                        ]}
                    >
                        Story
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.aspectButton,
                        aspectRatio === 'square' && styles.aspectButtonActive,
                    ]}
                    onPress={() => setAspectRatio('square')}
                >
                    <Ionicons
                        name="square"
                        size={18}
                        color={aspectRatio === 'square' ? COLORS.blackboard : COLORS.textSecondary}
                    />
                    <Text
                        style={[
                            styles.aspectText,
                            aspectRatio === 'square' && styles.aspectTextActive,
                        ]}
                    >
                        Post
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Preview */}
            <View style={styles.previewContainer}>
                <ViewShot
                    ref={viewShotRef}
                    options={{ format: 'png', quality: 1 }}
                >
                    <View style={[styles.blackboard, { height: containerHeight }]}>
                        {/* Blackboard texture overlay */}
                        <View style={styles.textureOverlay} />

                        {/* Content */}
                        <View style={styles.content}>
                            {/* Equation */}
                            <Text style={styles.equationLabel}>Problem:</Text>
                            <Text style={styles.equationText}>{equation}</Text>

                            {/* Divider */}
                            <View style={styles.chalkDivider} />

                            {/* Answer */}
                            <Text style={styles.answerLabel}>Answer:</Text>
                            <Text style={styles.answerText}>{answer}</Text>

                            {/* Steps (if fits) */}
                            {steps && steps.length > 0 && aspectRatio === 'portrait' && (
                                <>
                                    <View style={styles.chalkDivider} />
                                    <Text style={styles.stepsLabel}>Steps:</Text>
                                    {steps.slice(0, 5).map((step, i) => (
                                        <Text key={i} style={styles.stepText}>{step}</Text>
                                    ))}
                                    {steps.length > 5 && (
                                        <Text style={styles.moreText}>+ {steps.length - 5} more steps</Text>
                                    )}
                                </>
                            )}
                        </View>

                        {/* Watermark */}
                        <View style={styles.watermark}>
                            <Text style={styles.watermarkText}>AI Math Solver</Text>
                            <Text style={styles.watermarkSubtext}>by U&V Labs</Text>
                        </View>
                    </View>
                </ViewShot>
            </View>

            {/* Save Button */}
            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleExport}
                disabled={isSaving}
            >
                <LinearGradient
                    colors={[COLORS.chalkGreen, COLORS.chalkBlue]}
                    style={styles.saveButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Ionicons
                        name={isSaving ? 'hourglass' : 'download'}
                        size={22}
                        color={COLORS.blackboard}
                    />
                    <Text style={styles.saveButtonText}>
                        {isSaving ? 'Saving...' : 'Save to Gallery'}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.blackboard,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '600',
    },
    aspectToggle: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 20,
    },
    aspectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: COLORS.glassBackground,
    },
    aspectButtonActive: {
        backgroundColor: COLORS.chalkGreen,
    },
    aspectText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    aspectTextActive: {
        color: COLORS.blackboard,
        fontWeight: '600',
    },
    previewContainer: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    blackboard: {
        width: 320,
        backgroundColor: '#1A5F2A', // Classic blackboard green
        borderRadius: 8,
        padding: 25,
        borderWidth: 8,
        borderColor: '#8B4513', // Wood frame color
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    textureOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 4,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    equationLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    equationText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '500',
        letterSpacing: 1,
        marginBottom: 20,
    },
    chalkDivider: {
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginVertical: 15,
    },
    answerLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    answerText: {
        color: '#FCD34D', // Yellow chalk
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    stepsLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 10,
    },
    stepText: {
        color: '#F8FAFC',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 6,
    },
    moreText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 8,
    },
    watermark: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        alignItems: 'flex-end',
    },
    watermarkText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '600',
    },
    watermarkSubtext: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
    },
    saveButton: {
        marginHorizontal: 20,
        marginBottom: 40,
        borderRadius: 14,
        overflow: 'hidden',
    },
    saveButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
    },
    saveButtonText: {
        color: COLORS.blackboard,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default BlackboardExport;
