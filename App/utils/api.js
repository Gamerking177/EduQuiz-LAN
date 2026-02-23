import axios from 'axios';

// 🟢 Tumhara Render Backend URL
const BASE_URL = 'https://eduquiz-lan.onrender.com/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ==========================================
// 🎮 1. GAME ROUTES
// ==========================================

// 1.1 Create Game (Host)
export const createGame = async (gameData) => {
    try {
        const response = await apiClient.post('/game/create', gameData);
        return response.data; // { success, message, data: { gameId, roomCode } }
    } catch (error) {
        console.error("Create Game API Error:", error?.response?.data || error.message);
        throw error;
    }
};

// 1.2 Join Game (Player)
export const joinGame = async (joinData) => {
    try {
        const response = await apiClient.post('/game/join', joinData);
        return response.data; // { success, message, data: { quizTopic } }
    } catch (error) {
        console.error("Join Game API Error:", error?.response?.data || error.message);
        throw error;
    }
};

// 1.3 Get Game Info
export const getGameInfo = async (roomCode) => {
    try {
        const response = await apiClient.get(`/game/${roomCode}`);
        return response.data;
    } catch (error) {
        console.error("Get Game Info Error:", error?.response?.data || error.message);
        throw error;
    }
};

// ==========================================
// 📚 2. QUESTION ROUTES
// ==========================================

export const addQuestion = async (questionData) => {
    try {
        const response = await apiClient.post('/questions/add', questionData);
        return response.data;
    } catch (error) {
        console.error("Add Question API Error:", error?.response?.data || error.message);
        throw error;
    }
};