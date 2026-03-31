import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useGameStore = create(
    persist(
        (set) => ({
            // 🟢 State Variables (Data)
            roomCode: '',
            playerName: '',
            isHost: false,
            players: [],
            quizData: null,
            deviceId: null,
            finalReport: null,
            hasFinished: false, // 🟢 THE LOCK: Double popup rokne ke liye

            // 🟢 Actions (Data update karne ke functions)
            setRoomCode: (code) => set({ roomCode: code }),
            setPlayerName: (name) => set({ playerName: name }),
            setIsHost: (status) => set({ isHost: status }),
            setQuizData: (data) => set({ quizData: data }),
            setDeviceId: (id) => set({ deviceId: id }),
            setFinalReport: (report) => set({ finalReport: report }), 
            setHasFinished: (status) => set({ hasFinished: status }), // 🟢 LOCK UPDATE FUNCTION
            
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
                quizData: null,
                finalReport: null, 
                hasFinished: false // 🟢 RESET LOCK: Agle naye game ke liye lock kholna zaroori hai
            }),
        }),
        {
            name: "eduQuiz-session",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useGameStore;