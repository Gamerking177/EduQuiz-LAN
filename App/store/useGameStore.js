import { create } from 'zustand';

const useGameStore = create((set) => ({
    // 🟢 State Variables (Data)
    roomCode: '',
    playerName: '',
    isHost: false,
    players: [],
    quizData: null,
    deviceId: null,

    // 🟢 Actions (Data update karne ke functions)
    setRoomCode: (code) => set({ roomCode: code }),
    setPlayerName: (name) => set({ playerName: name }),
    setIsHost: (status) => set({ isHost: status }),
    setQuizData: (data) => set({ quizData: data }),
    setDeviceId: (id) => set({ deviceId: id }),
    
    // 🟢 Socket.io ke liye Player Management
    addPlayer: (player) => set((state) => ({ 
        players: [...state.players, player] 
    })),
    removePlayer: (playerId) => set((state) => ({
        players: state.players.filter((p) => p.id !== playerId)
    })),
    setPlayers: (playersList) => set({ players: playersList }),

    // 🟢 Reset Store (Jab game khatam ho jaye ya user back aa jaye)
    clearStore: () => set({ 
        roomCode: '', 
        playerName: '', 
        isHost: false, 
        players: [], 
        quizData: null 
    })
}));

export default useGameStore;