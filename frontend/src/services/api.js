import axios from 'axios';

// 🔴 IMPORTANT: Replace this with your Render backend URL after deployment
const API_BASE_URL = 'https://your-app-name.onrender.com';

// For local development, use:
// const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // 60 seconds timeout for processing
    headers: {
        'Content-Type': 'application/json',
    },
});

export const solveEquation = async (base64Image) => {
    try {
        const response = await api.post('/solve', {
            image: base64Image,
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const solveTextEquation = async (equation) => {
    try {
        const response = await api.post('/solve-text', {
            equation: equation,
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const testOCR = async (base64Image) => {
    try {
        const response = await api.post('/test-ocr', {
            image: base64Image,
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const healthCheck = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
};

export default api;