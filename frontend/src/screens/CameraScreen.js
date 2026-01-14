/**
 * CameraScreen - Updated for Expo SDK 54+
 * Uses CameraView and useCameraPermissions hook
 * Built with 💻 by UV
 */

import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/theme';
import GlassButton from '../components/GlassButton';
import LoadingOverlay from '../components/LoadingOverlay';
import { solveEquation } from '../services/api';

const CameraScreen = ({ navigation, route }) => {
    // SDK 54+ uses useCameraPermissions hook
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const cameraRef = useRef(null);
    const pickFromGallery = route.params?.pickFromGallery;

    // Auto-pick from gallery if navigated with that option
    React.useEffect(() => {
        if (pickFromGallery) {
            pickImage();
        }
    }, [pickFromGallery]);

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.5,
                    base64: true,
                });
                setCapturedImage(photo);
            } catch (error) {
                console.error('Camera error:', error);
                Alert.alert('Error', 'Failed to take picture. Please try again.');
            }
        }
    };

    const pickImage = async () => {
        try {
            // Request media library permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow access to your photos to use this feature.');
                if (pickFromGallery) navigation.goBack();
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.5,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                setCapturedImage({
                    uri: result.assets[0].uri,
                    base64: result.assets[0].base64,
                });
            } else if (pickFromGallery) {
                navigation.goBack();
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
            if (pickFromGallery) navigation.goBack();
        }
    };

    const processImage = async () => {
        if (!capturedImage?.base64) {
            Alert.alert('Error', 'No image to process');
            return;
        }

        setLoading(true);
        setLoadingMessage('Scanning equation...');

        try {
            setTimeout(() => setLoadingMessage('Analyzing handwriting...'), 1500);
            setTimeout(() => setLoadingMessage('Solving equation...'), 3000);

            const result = await solveEquation(capturedImage.base64);

            if (result.success) {
                navigation.navigate('Result', { result });
            } else {
                Alert.alert(
                    'Recognition Failed',
                    result.error || 'Could not recognize the equation. Please try again.',
                    [
                        { text: 'Try Again', onPress: () => setCapturedImage(null) },
                        { text: 'Go Back', onPress: () => navigation.goBack() },
                    ]
                );
            }
        } catch (error) {
            console.error('Process error:', error);
            Alert.alert(
                'Error',
                'Failed to process image. Please check your connection and try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const retake = () => {
        setCapturedImage(null);
    };

    // Permission loading state
    if (!permission) {
        return (
            <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
                style={styles.container}
            >
                <Text style={styles.permissionText}>Loading camera...</Text>
            </LinearGradient>
        );
    }

    // Permission not granted - show request button
    if (!permission.granted) {
        return (
            <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
                style={styles.container}
            >
                <View style={styles.permissionContainer}>
                    <Ionicons name="camera" size={60} color={COLORS.primary} />
                    <Text style={styles.permissionTitle}>Camera Access Needed</Text>
                    <Text style={styles.permissionText}>
                        We need camera access to scan your equations
                    </Text>
                    <GlassButton
                        title="Grant Permission"
                        icon="checkmark-circle"
                        variant="primary"
                        onPress={requestPermission}
                        style={{ marginTop: 20, marginBottom: 15 }}
                    />
                    <GlassButton
                        title="Pick from Gallery Instead"
                        icon="images"
                        variant="secondary"
                        onPress={pickImage}
                        style={{ marginBottom: 15 }}
                    />
                    <GlassButton
                        title="Go Back"
                        icon="arrow-back"
                        variant="secondary"
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </LinearGradient>
        );
    }

    return (
        <View style={styles.container}>
            {capturedImage ? (
                // Preview mode
                <View style={styles.previewContainer}>
                    <Image
                        source={{ uri: capturedImage.uri }}
                        style={styles.previewImage}
                        resizeMode="contain"
                    />

                    {/* Overlay instructions */}
                    <View style={styles.previewOverlay}>
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.previewGradient}
                        >
                            <Text style={styles.previewTitle}>Preview</Text>
                            <Text style={styles.previewSubtitle}>
                                Make sure the equation is clearly visible
                            </Text>

                            <View style={styles.previewButtons}>
                                <GlassButton
                                    title="Retake"
                                    icon="refresh"
                                    variant="secondary"
                                    onPress={retake}
                                    style={styles.previewButton}
                                />
                                <GlassButton
                                    title="Solve"
                                    icon="checkmark-circle"
                                    variant="success"
                                    onPress={processImage}
                                    style={styles.previewButton}
                                />
                            </View>
                        </LinearGradient>
                    </View>
                </View>
            ) : (
                // Camera mode - Using CameraView for SDK 54+
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="back"
                >
                    {/* Back button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <LinearGradient
                            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                            style={styles.backButtonGradient}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Guide overlay */}
                    <View style={styles.guideContainer}>
                        <View style={styles.guideBox}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                        <Text style={styles.guideText}>
                            Position the equation within the frame
                        </Text>
                    </View>

                    {/* Bottom controls */}
                    <View style={styles.controls}>
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.controlsGradient}
                        >
                            <TouchableOpacity
                                style={styles.galleryButton}
                                onPress={pickImage}
                            >
                                <Ionicons name="images" size={28} color={COLORS.white} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.captureButton}
                                onPress={takePicture}
                            >
                                <LinearGradient
                                    colors={[COLORS.primary, COLORS.secondary]}
                                    style={styles.captureButtonInner}
                                >
                                    <View style={styles.captureButtonCenter} />
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.placeholderButton} />
                        </LinearGradient>
                    </View>
                </CameraView>
            )}

            <LoadingOverlay visible={loading} message={loadingMessage} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    camera: {
        flex: 1,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    permissionTitle: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    permissionText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        textAlign: 'center',
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 20,
        zIndex: 10,
    },
    backButtonGradient: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    guideContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    guideBox: {
        width: '85%',
        height: 200,
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: 20,
        borderStyle: 'dashed',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: COLORS.primary,
        borderWidth: 3,
    },
    topLeft: {
        top: -2,
        left: -2,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 20,
    },
    topRight: {
        top: -2,
        right: -2,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 20,
    },
    bottomLeft: {
        bottom: -2,
        left: -2,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 20,
    },
    bottomRight: {
        bottom: -2,
        right: -2,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 20,
    },
    guideText: {
        color: COLORS.white,
        fontSize: 16,
        marginTop: 20,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    controls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    controlsGradient: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 40,
        paddingBottom: Platform.OS === 'ios' ? 50 : 40,
    },
    galleryButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 25,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    captureButtonInner: {
        flex: 1,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonCenter: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.white,
    },
    placeholderButton: {
        width: 50,
        height: 50,
    },
    previewContainer: {
        flex: 1,
    },
    previewImage: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    previewOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    previewGradient: {
        paddingTop: 60,
        paddingBottom: Platform.OS === 'ios' ? 50 : 40,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    previewTitle: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    previewSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 30,
    },
    previewButtons: {
        flexDirection: 'row',
        gap: 15,
    },
    previewButton: {
        flex: 1,
    },
});

export default CameraScreen;