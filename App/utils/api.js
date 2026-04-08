import axios from 'axios';

// 🟢 Tumhara Backend URL (Abhi local hai, baad mein Render wala uncomment kar dena)
const BASE_URL = 'https://eduquiz-lan.onrender.com/api';
// const BASE_URL = 'http://192.168.1.2:3000/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 🌟 THE MAGIC FUNCTION: Ye function login ke baad Axios ko token de dega
export const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization']; // Logout ke time token hata dega
    }
};

// ==========================================
// 🔐 1. AUTH ROUTES
// ==========================================

export const registerUser = async (userData) => {
    try {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error("Register API Error:", error?.response?.data || error.message);
        throw error;
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        console.error("Login API Error:", error?.response?.data || error.message);
        throw error;
    }
};

// 🟢 NAYA FIX: Logout Route Add Kiya
export const logoutUser = async () => {
    try {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    } catch (error) {
        console.error("Logout API Error:", error?.response?.data || error.message);
        throw error;
    }
};

// ==========================================
// 👤 2. USER ROUTES (Protected - Token Required)
// ==========================================

export const getUserProfile = async () => {
    try {
        const response = await apiClient.get('/users/profile');
        return response.data;
    } catch (error) {
        console.error("Get Profile Error:", error?.response?.data || error.message);
        throw error;
    }
};

export const updateUserProfile = async (updateData) => {
    try {
        const response = await apiClient.put('/users/profile', updateData);
        return response.data;
    } catch (error) {
        console.error("Update Profile Error:", error?.response?.data || error.message);
        throw error;
    }
};

// ==========================================
// 🎮 3. GAME ROUTES
// ==========================================

// 3.1 Create Game (Host) - Protected Route
export const createGame = async (gameData) => {
    try {
        const response = await apiClient.post('/game/create', gameData);
        return response.data; // { success, message, data: { gameId, roomCode } }
    } catch (error) {
        console.error("Create Game API Error:", error?.response?.data || error.message);
        throw error;
    }
};

// 3.2 Join Game (Player) - Public/Protected depending on your logic
export const joinGame = async (joinData) => {
    try {
        const response = await apiClient.post('/game/join', joinData);
        return response.data; // { success, message, data: { quizTopic } }
    } catch (error) {
        console.error("Join Game API Error:", error?.response?.data || error.message);
        throw error;
    }
};

// 3.3 Get Game Info
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
// 📚 4. QUESTION ROUTES (Protected)
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