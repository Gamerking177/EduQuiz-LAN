import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, Clock, LogOut, ShieldCheck } from 'lucide-react-native';

import socketService from '../utils/socket';
import useGameStore from '../store/useGameStore';

export default function WaitingArea() {
    const router = useRouter();
    
    // Zustand se data nikal lo
    const roomCode = useGameStore((state) => state.roomCode);
    const playerName = useGameStore((state) => state.playerName);
    const quizData = useGameStore((state) => state.quizData);
    
    // Local state for players list
    const [players, setPlayers] = useState([]);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        // 1. Socket connect check
        const socket = socketService.connect();

        console.log(`📡 [WaitingArea] Listening for room: ${roomCode}`);

        // 2. Room update listener (Jab koi naya join karega)
        socketService.on("room-update", (data) => {
            console.log("👥 [Socket] Players list updated:", data.players);
            setPlayers(data.players);
        });

        // 3. Game Start listener (Jab host game start karega)
        socketService.on("game-started", (data) => {
            console.log("🚀 [Socket] Game is starting!");
            setIsStarting(true);
            setTimeout(() => {
                router.push('/question-panel'); // Agla step: Question Panel
            }, 1500);
        });

        // Cleanup on unmount
        return () => {
            socketService.off("room-update");
            socketService.off("game-started");
        };
    }, [roomCode]);

    const handleLeave = () => {
        socketService.emit("leave-room", { roomCode, playerName });
        router.replace('/home');
    };

    return (
        <SafeAreaView className="flex-1 bg-[#050B18] px-6">
            {/* Header */}
            <View className="flex-row items-center justify-between py-6">
                <View>
                    <Text className="text-gray-500 font-[Manrope-Medium] text-xs uppercase tracking-widest">Waiting for Host</Text>
                    <Text className="text-white font-[Manrope-Bold] text-2xl">Room: {roomCode}</Text>
                </View>
                <TouchableOpacity onPress={handleLeave} className="bg-red-500/10 p-3 rounded-2xl border border-red-500/20">
                    <LogOut size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            {/* Quiz Info Card */}
            <View className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-[32px] mb-8 flex-row items-center">
                <View className="bg-indigo-600 p-3 rounded-2xl mr-4">
                    <ShieldCheck size={24} color="white" />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-[Manrope-Bold] text-lg" numberOfLines={1}>
                        {quizData?.quizTopic || "Loading Quiz..."}
                    </Text>
                    <Text className="text-indigo-400 font-[Manrope-Medium] text-xs">
                        {quizData?.totalQuestions || 0} Questions • 30s per Q
                    </Text>
                </View>
            </View>

            {/* Players Section */}
            <View className="flex-1">
                <View className="flex-row items-center justify-between mb-4 px-2">
                    <View className="flex-row items-center">
                        <Users size={18} color="#6366f1" />
                        <Text className="text-white font-[Manrope-Bold] ml-2">Players Joined</Text>
                    </View>
                    <Text className="text-indigo-500 font-[Manrope-Bold] bg-indigo-500/10 px-3 py-1 rounded-full text-xs">
                        {players.length} Active
                    </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View className="flex-row flex-wrap justify-between">
                        {players.map((player, index) => (
                            <View 
                                key={index} 
                                className={`w-[48%] mb-4 p-4 rounded-3xl border ${player.name === playerName ? 'bg-indigo-600 border-indigo-400' : 'bg-[#111827]/50 border-gray-800'}`}
                            >
                                <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mb-2">
                                    <Text className="text-white font-[Manrope-Bold]">{player.name.charAt(0).toUpperCase()}</Text>
                                </View>
                                <Text className="text-white font-[Manrope-Bold]" numberOfLines={1}>{player.name}</Text>
                                <Text className="text-gray-400 text-[10px] font-[Manrope-Medium]">
                                    {player.name === playerName ? "You" : "Player"}
                                </Text>
                            </View>
                        ))}

                        {players.length === 0 && (
                            <View className="w-full items-center py-20">
                                <ActivityIndicator color="#6366f1" />
                                <Text className="text-gray-500 mt-4 font-[Manrope-Medium]">Connecting to room...</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>

            {/* Footer Status */}
            <View className="py-8 items-center border-t border-gray-900">
                {isStarting ? (
                    <View className="flex-row items-center bg-green-500/20 px-6 py-3 rounded-full border border-green-500/30">
                        <ActivityIndicator size="small" color="#22c55e" className="mr-3" />
                        <Text className="text-green-500 font-[Manrope-Bold]">Starting Game...</Text>
                    </View>
                ) : (
                    <View className="flex-row items-center">
                        <Clock size={16} color="#4B5563" />
                        <Text className="text-gray-500 font-[Manrope-Medium] ml-2">Waiting for host to launch...</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}