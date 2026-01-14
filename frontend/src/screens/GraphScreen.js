/**
 * GraphScreen - Interactive Offline Graph Plotter
 * Dark cyberpunk theme with zoom, pan, and point detection
 */

import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../styles/theme';
import GlassCard from '../components/GlassCard';
import { generatePoints, findRoots, findVertices } from '../utils/ExpressionParser';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRAPH_WIDTH = SCREEN_WIDTH - 40;
const GRAPH_HEIGHT = 300;
const PADDING = 40;

const GraphScreen = ({ navigation }) => {
    const [expression, setExpression] = useState('');
    const [points, setPoints] = useState([]);
    const [roots, setRoots] = useState([]);
    const [vertices, setVertices] = useState([]);
    const [xRange, setXRange] = useState({ min: -10, max: 10 });
    const [yRange, setYRange] = useState({ min: -10, max: 10 });
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [error, setError] = useState(null);

    // Example functions for quick testing
    const EXAMPLES = [
        { label: 'x²', expr: 'x^2' },
        { label: 'sin(x)', expr: 'sin(x)' },
        { label: 'x³-3x', expr: 'x^3-3*x' },
        { label: '1/x', expr: '1/x' },
        { label: 'cos(x)', expr: 'cos(x)' },
        { label: '|x|', expr: 'abs(x)' },
    ];

    // Convert math coordinates to screen coordinates
    const toScreenX = (x) => {
        return PADDING + ((x - xRange.min) / (xRange.max - xRange.min)) * (GRAPH_WIDTH - 2 * PADDING);
    };

    const toScreenY = (y) => {
        return GRAPH_HEIGHT - PADDING - ((y - yRange.min) / (yRange.max - yRange.min)) * (GRAPH_HEIGHT - 2 * PADDING);
    };

    // Generate path data for the function
    const generatePath = () => {
        if (points.length < 2) return '';

        let path = `M ${toScreenX(points[0].x)} ${toScreenY(points[0].y)}`;

        for (let i = 1; i < points.length; i++) {
            const screenX = toScreenX(points[i].x);
            const screenY = toScreenY(points[i].y);

            // Skip points that are off-screen
            if (screenY < 0 || screenY > GRAPH_HEIGHT) {
                if (i + 1 < points.length) {
                    path += ` M ${toScreenX(points[i + 1].x)} ${toScreenY(points[i + 1].y)}`;
                }
                continue;
            }

            path += ` L ${screenX} ${screenY}`;
        }

        return path;
    };

    // Plot the function
    const plotFunction = () => {
        if (!expression.trim()) {
            setError('Please enter an expression');
            return;
        }

        try {
            const newPoints = generatePoints(expression, xRange.min, xRange.max, 300);

            if (newPoints.length === 0) {
                setError('Could not plot this function');
                return;
            }

            // Auto-adjust y-range based on points
            const yValues = newPoints.map(p => p.y).filter(y => isFinite(y));
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            const padding = (maxY - minY) * 0.1 || 2;

            setYRange({
                min: Math.max(minY - padding, -100),
                max: Math.min(maxY + padding, 100),
            });

            setPoints(newPoints);
            setRoots(findRoots(expression, xRange.min, xRange.max));
            setVertices(findVertices(expression, xRange.min, xRange.max));
            setError(null);
        } catch (e) {
            setError(`Error: ${e.message}`);
        }
    };

    // Zoom in/out
    const zoom = (factor) => {
        const centerX = (xRange.max + xRange.min) / 2;
        const centerY = (yRange.max + yRange.min) / 2;
        const rangeX = (xRange.max - xRange.min) * factor;
        const rangeY = (yRange.max - yRange.min) * factor;

        setXRange({ min: centerX - rangeX / 2, max: centerX + rangeX / 2 });
        setYRange({ min: centerY - rangeY / 2, max: centerY + rangeY / 2 });
    };

    // Handle touch on graph
    const handleGraphTouch = (event) => {
        const { locationX, locationY } = event.nativeEvent;

        // Convert screen coordinates to math coordinates
        const x = xRange.min + (locationX - PADDING) / (GRAPH_WIDTH - 2 * PADDING) * (xRange.max - xRange.min);
        const y = yRange.max - (locationY - PADDING) / (GRAPH_HEIGHT - 2 * PADDING) * (yRange.max - yRange.min);

        setSelectedPoint({ x: x.toFixed(2), y: y.toFixed(2) });
    };

    // Generate grid lines
    const renderGrid = () => {
        const lines = [];
        const xStep = (xRange.max - xRange.min) / 10;
        const yStep = (yRange.max - yRange.min) / 10;

        // Vertical grid lines
        for (let x = Math.ceil(xRange.min); x <= xRange.max; x += Math.ceil(xStep)) {
            lines.push(
                <Line
                    key={`v${x}`}
                    x1={toScreenX(x)}
                    y1={PADDING}
                    x2={toScreenX(x)}
                    y2={GRAPH_HEIGHT - PADDING}
                    stroke={COLORS.graphGrid}
                    strokeWidth={1}
                />
            );
        }

        // Horizontal grid lines
        for (let y = Math.ceil(yRange.min); y <= yRange.max; y += Math.ceil(yStep)) {
            lines.push(
                <Line
                    key={`h${y}`}
                    x1={PADDING}
                    y1={toScreenY(y)}
                    x2={GRAPH_WIDTH - PADDING}
                    y2={toScreenY(y)}
                    stroke={COLORS.graphGrid}
                    strokeWidth={1}
                />
            );
        }

        return lines;
    };

    // Render axes
    const renderAxes = () => {
        const xAxisY = toScreenY(0);
        const yAxisX = toScreenX(0);

        return (
            <>
                {/* X-axis */}
                {xAxisY >= PADDING && xAxisY <= GRAPH_HEIGHT - PADDING && (
                    <Line
                        x1={PADDING}
                        y1={xAxisY}
                        x2={GRAPH_WIDTH - PADDING}
                        y2={xAxisY}
                        stroke={COLORS.chalkWhite}
                        strokeWidth={2}
                    />
                )}

                {/* Y-axis */}
                {yAxisX >= PADDING && yAxisX <= GRAPH_WIDTH - PADDING && (
                    <Line
                        x1={yAxisX}
                        y1={PADDING}
                        x2={yAxisX}
                        y2={GRAPH_HEIGHT - PADDING}
                        stroke={COLORS.chalkWhite}
                        strokeWidth={2}
                    />
                )}
            </>
        );
    };

    return (
        <LinearGradient
            colors={[COLORS.graphBackground, '#0A0F1A', COLORS.blackboard]}
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
                <Text style={styles.headerTitle}>Graph Plotter</Text>
                <View style={styles.offlineBadge}>
                    <Text style={styles.offlineBadgeText}>100% Offline</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Input Section */}
                <GlassCard style={styles.inputCard}>
                    <Text style={styles.inputLabel}>Enter function (use x as variable)</Text>
                    <View style={styles.inputRow}>
                        <Text style={styles.yEquals}>y =</Text>
                        <TextInput
                            style={styles.input}
                            value={expression}
                            onChangeText={setExpression}
                            placeholder="x^2 - 4"
                            placeholderTextColor={COLORS.textMuted}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity style={styles.plotButton} onPress={plotFunction}>
                            <LinearGradient
                                colors={[COLORS.graphLine, COLORS.graphLineAlt]}
                                style={styles.plotButtonGradient}
                            >
                                <Ionicons name="analytics" size={20} color={COLORS.white} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Example buttons */}
                    <View style={styles.examplesRow}>
                        {EXAMPLES.map((ex) => (
                            <TouchableOpacity
                                key={ex.expr}
                                style={styles.exampleButton}
                                onPress={() => {
                                    setExpression(ex.expr);
                                }}
                            >
                                <Text style={styles.exampleText}>{ex.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </GlassCard>

                {/* Error Message */}
                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Graph */}
                <View style={styles.graphContainer}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handleGraphTouch}
                    >
                        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
                            {/* Background */}
                            <Path
                                d={`M ${PADDING} ${PADDING} L ${GRAPH_WIDTH - PADDING} ${PADDING} L ${GRAPH_WIDTH - PADDING} ${GRAPH_HEIGHT - PADDING} L ${PADDING} ${GRAPH_HEIGHT - PADDING} Z`}
                                fill={COLORS.blackboardDark}
                            />

                            {/* Grid */}
                            {renderGrid()}

                            {/* Axes */}
                            {renderAxes()}

                            {/* Function curve */}
                            {points.length > 0 && (
                                <Path
                                    d={generatePath()}
                                    stroke={COLORS.graphLine}
                                    strokeWidth={3}
                                    fill="none"
                                />
                            )}

                            {/* Roots (x-intercepts) */}
                            {roots.map((root, i) => (
                                <Circle
                                    key={`root${i}`}
                                    cx={toScreenX(root.x)}
                                    cy={toScreenY(0)}
                                    r={6}
                                    fill={COLORS.chalkGreen}
                                />
                            ))}

                            {/* Vertices */}
                            {vertices.map((vertex, i) => (
                                <Circle
                                    key={`vertex${i}`}
                                    cx={toScreenX(vertex.x)}
                                    cy={toScreenY(vertex.y)}
                                    r={6}
                                    fill={vertex.type === 'max' ? COLORS.error : COLORS.chalkBlue}
                                />
                            ))}

                            {/* Axis labels */}
                            <SvgText
                                x={GRAPH_WIDTH - PADDING + 10}
                                y={toScreenY(0) + 4}
                                fontSize={12}
                                fill={COLORS.textMuted}
                            >
                                x
                            </SvgText>
                            <SvgText
                                x={toScreenX(0) - 10}
                                y={PADDING - 5}
                                fontSize={12}
                                fill={COLORS.textMuted}
                            >
                                y
                            </SvgText>
                        </Svg>
                    </TouchableOpacity>

                    {/* Zoom Controls */}
                    <View style={styles.zoomControls}>
                        <TouchableOpacity style={styles.zoomButton} onPress={() => zoom(0.5)}>
                            <Ionicons name="add" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.zoomButton} onPress={() => zoom(2)}>
                            <Ionicons name="remove" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {/* Coordinate Display */}
                    {selectedPoint && (
                        <View style={styles.coordDisplay}>
                            <Text style={styles.coordText}>
                                ({selectedPoint.x}, {selectedPoint.y})
                            </Text>
                        </View>
                    )}
                </View>

                {/* Legend */}
                {(roots.length > 0 || vertices.length > 0) && (
                    <GlassCard style={styles.legendCard}>
                        <Text style={styles.legendTitle}>Key Points</Text>

                        {roots.length > 0 && (
                            <View style={styles.legendRow}>
                                <View style={[styles.legendDot, { backgroundColor: COLORS.chalkGreen }]} />
                                <Text style={styles.legendText}>
                                    Roots: {roots.map(r => `x = ${r.x.toFixed(2)}`).join(', ')}
                                </Text>
                            </View>
                        )}

                        {vertices.filter(v => v.type === 'min').length > 0 && (
                            <View style={styles.legendRow}>
                                <View style={[styles.legendDot, { backgroundColor: COLORS.chalkBlue }]} />
                                <Text style={styles.legendText}>
                                    Min: {vertices.filter(v => v.type === 'min').map(v => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`).join(', ')}
                                </Text>
                            </View>
                        )}

                        {vertices.filter(v => v.type === 'max').length > 0 && (
                            <View style={styles.legendRow}>
                                <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
                                <Text style={styles.legendText}>
                                    Max: {vertices.filter(v => v.type === 'max').map(v => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`).join(', ')}
                                </Text>
                            </View>
                        )}
                    </GlassCard>
                )}
            </ScrollView>
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
    offlineBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(6, 182, 212, 0.4)',
    },
    offlineBadgeText: {
        color: COLORS.graphLineAlt,
        fontSize: 11,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    inputCard: {
        marginBottom: 15,
    },
    inputLabel: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    yEquals: {
        color: COLORS.graphLine,
        fontSize: 18,
        fontWeight: '600',
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        color: COLORS.white,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    plotButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    plotButtonGradient: {
        padding: 12,
        borderRadius: 12,
    },
    examplesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    exampleButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 8,
    },
    exampleText: {
        color: COLORS.textSecondary,
        fontSize: 13,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        backgroundColor: 'rgba(248, 113, 113, 0.15)',
        borderRadius: 10,
        marginBottom: 15,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 13,
    },
    graphContainer: {
        backgroundColor: COLORS.blackboard,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        marginBottom: 15,
    },
    zoomControls: {
        position: 'absolute',
        right: 10,
        top: 10,
        gap: 8,
    },
    zoomButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    coordDisplay: {
        position: 'absolute',
        left: 10,
        top: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    coordText: {
        color: COLORS.graphLine,
        fontSize: 13,
        fontWeight: '600',
    },
    legendCard: {
        marginTop: 5,
    },
    legendTitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginBottom: 10,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        color: COLORS.textPrimary,
        fontSize: 13,
        flex: 1,
    },
});

export default GraphScreen;
