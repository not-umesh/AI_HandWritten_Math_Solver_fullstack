/**
 * History Storage Service
 * Manages locally cached solutions using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@math_solver_history';
const SETTINGS_KEY = '@math_solver_settings';
const CACHE_KEY = '@math_solver_cache';

// Topic classification keywords
const TOPIC_KEYWORDS = {
    'Quadratic Equations': ['x²', 'x^2', 'quadratic', 'ax²+bx+c', 'b²-4ac', 'discriminant'],
    'Linear Equations': ['linear', 'slope', 'y=mx+b', 'straight line'],
    'Trigonometry': ['sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'θ', 'angle', 'radian', 'degree'],
    'Calculus': ['derivative', 'integral', 'dx', 'dy', 'limit', 'lim', 'd/dx', '∫', 'differentiate', 'integrate'],
    'Algebra': ['solve', 'equation', 'simplify', 'factor', 'expand', 'polynomial'],
    'Matrices': ['matrix', 'determinant', 'inverse', 'transpose', 'eigenvalue'],
    'Geometry': ['area', 'perimeter', 'volume', 'triangle', 'circle', 'rectangle', 'sphere'],
    'Statistics': ['mean', 'median', 'mode', 'variance', 'deviation', 'probability'],
    'Logarithms': ['log', 'ln', 'logarithm', 'exponential', 'e^'],
    'Arithmetic': ['add', 'subtract', 'multiply', 'divide', '+', '-', '*', '/'],
};

/**
 * Classify equation into a topic folder
 */
export const classifyTopic = (equation) => {
    const lowerEq = equation.toLowerCase();

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerEq.includes(keyword.toLowerCase())) {
                return topic;
            }
        }
    }

    return 'Other';
};

/**
 * Calculate difficulty based on solution complexity
 */
export const calculateDifficulty = (steps) => {
    if (!steps || steps.length === 0) return 'easy';
    if (steps.length <= 2) return 'easy';
    if (steps.length <= 5) return 'medium';
    return 'hard';
};

/**
 * Save a solution to history
 */
export const saveSolution = async (equation, result) => {
    try {
        const history = await getHistory();

        const entry = {
            id: Date.now().toString(),
            equation: equation,
            solution: result.solution,
            steps: result.steps,
            explanation: result.explanation,
            type: result.equation_type,
            topic: classifyTopic(equation),
            difficulty: calculateDifficulty(result.steps),
            timestamp: new Date().toISOString(),
        };

        history.unshift(entry); // Add to beginning

        // Keep only last 500 entries
        const trimmedHistory = history.slice(0, 500);

        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));

        return entry;
    } catch (error) {
        console.error('Error saving solution:', error);
        return null;
    }
};

/**
 * Get all history entries
 */
export const getHistory = async () => {
    try {
        const data = await AsyncStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting history:', error);
        return [];
    }
};

/**
 * Get history grouped by topic folders
 */
export const getHistoryByTopics = async () => {
    try {
        const history = await getHistory();
        const grouped = {};

        history.forEach(entry => {
            const topic = entry.topic || 'Other';
            if (!grouped[topic]) {
                grouped[topic] = [];
            }
            grouped[topic].push(entry);
        });

        return grouped;
    } catch (error) {
        console.error('Error grouping history:', error);
        return {};
    }
};

/**
 * Search history by query
 */
export const searchHistory = async (query) => {
    try {
        const history = await getHistory();
        const lowerQuery = query.toLowerCase();

        return history.filter(entry =>
            entry.equation.toLowerCase().includes(lowerQuery) ||
            entry.solution.toLowerCase().includes(lowerQuery) ||
            entry.topic.toLowerCase().includes(lowerQuery)
        );
    } catch (error) {
        console.error('Error searching history:', error);
        return [];
    }
};

/**
 * Delete a history entry
 */
export const deleteHistoryEntry = async (id) => {
    try {
        const history = await getHistory();
        const filtered = history.filter(entry => entry.id !== id);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting entry:', error);
        return false;
    }
};

/**
 * Clear all history
 */
export const clearHistory = async () => {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing history:', error);
        return false;
    }
};

/**
 * Cache a solution for offline access
 */
export const cacheSolution = async (equation, result) => {
    try {
        const cache = await getCache();
        const normalizedEq = equation.toLowerCase().replace(/\s+/g, '');

        cache[normalizedEq] = {
            result,
            cachedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        return true;
    } catch (error) {
        console.error('Error caching solution:', error);
        return false;
    }
};

/**
 * Get cached solution
 */
export const getCachedSolution = async (equation) => {
    try {
        const cache = await getCache();
        const normalizedEq = equation.toLowerCase().replace(/\s+/g, '');

        return cache[normalizedEq]?.result || null;
    } catch (error) {
        console.error('Error getting cached solution:', error);
        return null;
    }
};

/**
 * Get all cached solutions
 */
export const getCache = async () => {
    try {
        const data = await AsyncStorage.getItem(CACHE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('Error getting cache:', error);
        return {};
    }
};

/**
 * Save app settings
 */
export const saveSettings = async (settings) => {
    try {
        const current = await getSettings();
        const updated = { ...current, ...settings };
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
};

/**
 * Get app settings
 */
export const getSettings = async () => {
    try {
        const data = await AsyncStorage.getItem(SETTINGS_KEY);
        return data ? JSON.parse(data) : {
            explanationMode: 'standard',  // 'eli5', 'eli10', 'standard'
            showFullSolution: true,
            enableSound: true,
            animationSpeed: 1,  // 1 or 2
        };
    } catch (error) {
        console.error('Error getting settings:', error);
        return {};
    }
};

export default {
    saveSolution,
    getHistory,
    getHistoryByTopics,
    searchHistory,
    deleteHistoryEntry,
    clearHistory,
    cacheSolution,
    getCachedSolution,
    saveSettings,
    getSettings,
    classifyTopic,
};
