/**
 * HistoryScreen - Smart Auto-Folder History
 * Grid layout with topic folders and search functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TOPIC_COLORS } from '../styles/theme';
import GlassCard from '../components/GlassCard';
import {
    getHistoryByTopics,
    searchHistory,
    deleteHistoryEntry,
} from '../services/historyStorage';

// Topic icons mapping
const TOPIC_ICONS = {
    'Algebra': 'git-branch',
    'Calculus': 'analytics',
    'Trigonometry': 'pie-chart',
    'Geometry': 'shapes',
    'Arithmetic': 'calculator',
    'Statistics': 'bar-chart',
    'Matrices': 'grid',
    'Logarithms': 'infinite',
    'Linear Equations': 'trending-up',
    'Quadratic Equations': 'stats-chart',
    'Other': 'folder',
};

const HistoryScreen = ({ navigation }) => {
    const [historyByTopic, setHistoryByTopic] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Load history on mount
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const grouped = await getHistoryByTopics();
        setHistoryByTopic(grouped);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    }, []);

    // Handle search
    const handleSearch = async (query) => {
        setSearchQuery(query);

        if (query.trim().length > 0) {
            setIsSearching(true);
            const results = await searchHistory(query);
            setSearchResults(results);
        } else {
            setIsSearching(false);
            setSearchResults([]);
        }
    };

    // Get total count
    const getTotalCount = () => {
        return Object.values(historyByTopic).reduce((sum, items) => sum + items.length, 0);
    };

    // Get difficulty color
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return COLORS.chalkGreen;
            case 'medium': return COLORS.accent;
            case 'hard': return COLORS.error;
            default: return COLORS.textMuted;
        }
    };

    // Render folder card
    const renderFolderCard = ({ topic, items }) => {
        const color = TOPIC_COLORS[topic] || TOPIC_COLORS['Other'];
        const icon = TOPIC_ICONS[topic] || TOPIC_ICONS['Other'];

        return (
            <TouchableOpacity
                key={topic}
                style={styles.folderCard}
                onPress={() => setSelectedTopic(topic)}
            >
                <LinearGradient
                    colors={[`${color}20`, `${color}10`]}
                    style={styles.folderGradient}
                >
                    <View style={[styles.folderIcon, { backgroundColor: `${color}30` }]}>
                        <Ionicons name={icon} size={24} color={color} />
                    </View>
                    <Text style={styles.folderTitle}>{topic}</Text>
                    <Text style={styles.folderCount}>{items.length} problems</Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    // Render history item
    const renderHistoryItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.historyItem}
            onPress={() => navigation.navigate('Result', { result: item })}
        >
            <View style={styles.historyItemContent}>
                <Text style={styles.historyEquation} numberOfLines={1}>
                    {item.equation}
                </Text>
                <Text style={styles.historyAnswer} numberOfLines={1}>
                    = {item.solution}
                </Text>
                <View style={styles.historyMeta}>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>
                            {new Date(item.timestamp).toLocaleDateString()}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.difficultyDot,
                            { backgroundColor: getDifficultyColor(item.difficulty) }
                        ]}
                    />
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
    );

    // Topic detail view
    if (selectedTopic) {
        const items = historyByTopic[selectedTopic] || [];
        const color = TOPIC_COLORS[selectedTopic] || TOPIC_COLORS['Other'];

        return (
            <LinearGradient
                colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
                style={styles.container}
            >
                {/* Topic Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setSelectedTopic(null)}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color }]}>{selectedTopic}</Text>
                    <Text style={styles.headerCount}>{items.length}</Text>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                >
                    {items.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="folder-open-outline" size={48} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>No problems in this folder</Text>
                        </View>
                    ) : (
                        items.map(renderHistoryItem)
                    )}
                </ScrollView>
            </LinearGradient>
        );
    }

    // Main history view with folders
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
                <Text style={styles.headerTitle}>History</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{getTotalCount()}</Text>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={COLORS.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by equation or topic..."
                        placeholderTextColor={COLORS.textMuted}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
            >
                {isSearching ? (
                    // Search Results
                    <>
                        <Text style={styles.sectionTitle}>
                            Search Results ({searchResults.length})
                        </Text>
                        {searchResults.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
                                <Text style={styles.emptyText}>No results found</Text>
                            </View>
                        ) : (
                            searchResults.map(renderHistoryItem)
                        )}
                    </>
                ) : (
                    // Topic Folders Grid
                    <>
                        {Object.keys(historyByTopic).length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="time-outline" size={48} color={COLORS.textMuted} />
                                <Text style={styles.emptyText}>No history yet</Text>
                                <Text style={styles.emptySubtext}>
                                    Solved problems will appear here
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.foldersGrid}>
                                {Object.entries(historyByTopic).map(([topic, items]) =>
                                    renderFolderCard({ topic, items })
                                )}
                            </View>
                        )}
                    </>
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
        paddingBottom: 15,
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
    headerCount: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    countBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        borderRadius: 12,
    },
    countText: {
        color: COLORS.chalkGreen,
        fontSize: 13,
        fontWeight: '600',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.glassBackground,
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    searchInput: {
        flex: 1,
        color: COLORS.white,
        fontSize: 15,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginBottom: 15,
    },
    foldersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    folderCard: {
        width: '48%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    folderGradient: {
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        borderRadius: 16,
    },
    folderIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    folderTitle: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    folderCount: {
        color: COLORS.textMuted,
        fontSize: 12,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.glassBackground,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
    },
    historyItemContent: {
        flex: 1,
    },
    historyEquation: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    historyAnswer: {
        color: COLORS.chalkGreen,
        fontSize: 14,
        marginBottom: 8,
    },
    historyMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateBadge: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    dateText: {
        color: COLORS.textMuted,
        fontSize: 11,
    },
    difficultyDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        marginTop: 15,
    },
    emptySubtext: {
        color: COLORS.textMuted,
        fontSize: 13,
        marginTop: 5,
    },
});

export default HistoryScreen;
