import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, Clock, LogOut, ShieldCheck, Play } from 'lucide-react-native';

import socketService from '../utils/socket';
import useGameStore from '../store/useGameStore';
import CustomAlert from '../components/CustomAlert';

export default function WaitingArea() {
    const router = useRouter();

    // Zustand se data
    const roomCode = useGameStore((state) => state.roomCode);
    const playerName = useGameStore((state) => state.playerName);
    const quizData = useGameStore((state) => state.quizData);
    const isHost = useGameStore((state) => state.isHost);

    // Local State
    const [players, setPlayers] = useState([]);
    const [isStarting, setIsStarting] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });

    const showAlert = (title, message) => setAlertConfig({ visible: true, title, message });

    // Fallback names & text
    const safePlayerName = playerName || (isHost ? "Admin" : "Player");
    const displayTitle = quizData?.settings?.title || quizData?.title || "EduQuiz Game Room";
    const qCount = quizData?.questions?.length || quizData?.settings?.totalQuestions;
    const subtitleText = qCount ? `${qCount} Questions • 30s per Q` : "Waiting for Host to Start...";

    useEffect(() => {
        const socket = socketService.connect();
        console.log(`📡 [WaitingArea] Mounted. Joining room: ${roomCode}`);

        // 🟢 FIX 1: Room Join hamesha yahin se fire hoga taaki disconnect hone pe room na bhoole
        const triggerJoin = () => {
            socketService.emit("join_room", {
                name: safePlayerName,
                roomCode: roomCode,
                role: isHost ? "host" : "player"
            });
        };

        if (socket.connected) triggerJoin();
        else socket.once("connect", triggerJoin);

        // Agar internet hila aur wapas aaya, toh wapas join maaro
        socket.on("reconnect", triggerJoin);

        // 🟢 FIX 2: Single player join karega toh usko add karo
        socketService.on("player_joined", (data) => {
            console.log("👥 [Socket] Naya Player:", data.name);
            setPlayers((prev) => {
                if (prev.some(p => p.name === data.name)) return prev;
                return [...prev, { name: data.name }];
            });
        });

        // 🟢 FIX 3: Backend purane players 'update_leaderboard' mein bhejta hai. Usko bhi suno!
        socketService.on("update_leaderboard", (data) => {
            if (Array.isArray(data)) {
                // Backend database se saare players nikal ke state me daalo
                const fullList = data.map(p => ({ name: p.name }));
                setPlayers(fullList);
            }
        });

        // 🟢 FIX 4: Event name Underscore (_) ke sath hona chahiye
        socketService.on("game_started", () => {
            console.log("🚀 [Socket] Game Started!");
            setIsStarting(true);
            setTimeout(() => { router.push('/question-panel'); }, 1500);
        });

        return () => {
            socketService.off("player_joined");
            socketService.off("update_leaderboard");
            socketService.off("game_started");
            socket.off("reconnect");
        };
    }, [roomCode, isHost, safePlayerName]);

    const handleLeave = () => {
        router.replace('/home');
    };

    const handleStartGame = () => {
        if (players.length === 0) {
            showAlert("No Players Yet", "Bhai, kam se kam ek player toh join hone do!");
            return;
        }
        // Naya function call karo
        socketService.startGame(roomCode);
    };

    // 🟢 HOST & PLAYER INJECTION LOGIC (The Ultimate Fix)
    const allPlayers = (() => {
        // 1. Socket list se apna naam hata do (duplicate bachane ke liye)
        const otherPlayers = players.filter(p => p.name !== safePlayerName);

        // 2. Mera apna Card
        const myCard = { name: safePlayerName, isMe: true, isRealHost: isHost };

        // 3. Agar main Player hoon, toh mujhe Host ka card alag se add karna padega
        // Kyunki backend host ko players ki list mein nahi bhejta!
        if (!isHost) {
            const hostCard = { name: "Admin", isMe: false, isRealHost: true };
            return [myCard, hostCard, ...otherPlayers];
        }

        // Agar main Host hoon, toh bas main aur baaki players
        return [myCard, ...otherPlayers];
    })();

    return (
        <SafeAreaView className="flex-1 bg-[#050B18] px-6">
            {/* Header */}
            <View className="py-8 items-center justify-center">
                <View className="bg-indigo-600/10 px-6 py-2 rounded-full border border-indigo-500/20 mb-2">
                    <Text className="text-indigo-400 font-[Manrope-Bold] text-[10px] uppercase tracking-[4px]">Join Code</Text>
                </View>
                <View className="flex-row items-center">
                    <Text className="text-white font-[Manrope-Bold] text-5xl tracking-[8px]">
                        {roomCode?.split('').join(' ') || "------"}
                    </Text>
                </View>
                <View className="flex-row items-center mt-4">
                    <View className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                    <Text className="text-gray-500 font-[Manrope-Medium] text-sm">Waiting for more players...</Text>
                </View>
                <TouchableOpacity onPress={handleLeave} className="absolute top-6 right-0 bg-red-500/10 p-3 rounded-2xl border border-red-500/20">
                    <LogOut size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            {/* Quiz Info */}
            <View className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-[32px] mb-8 flex-row items-center">
                <View className="bg-indigo-600 p-3 rounded-2xl mr-4">
                    <ShieldCheck size={24} color="white" />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-[Manrope-Bold] text-lg" numberOfLines={1}>{displayTitle}</Text>
                    {/* 🟢 Yahan update kiya */}
                    <Text className="text-indigo-400 font-[Manrope-Medium] text-xs">
                        {subtitleText}
                    </Text>
                </View>
            </View>

            {/* Players List */}
            <View className="flex-1">
                <View className="flex-row items-center justify-between mb-4 px-2">
                    <View className="flex-row items-center">
                        <Users size={18} color="#6366f1" />
                        <Text className="text-white font-[Manrope-Bold] ml-2">Players Joined</Text>
                    </View>
                    <Text className="text-indigo-500 font-[Manrope-Bold] bg-indigo-500/10 px-3 py-1 rounded-full text-xs">
                        {allPlayers.length} Active
                    </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    <View className="flex-row flex-wrap justify-between">
                        {allPlayers.map((player, index) => {
                            // 🟢 Naya Badge Logic (Ab Host ko Host dikhayega)
                            let badgeText = "Player";
                            if (player.isMe && player.isRealHost) badgeText = "You (Host)";
                            else if (player.isRealHost) badgeText = "Host"; // Player ki screen pe Host ke liye
                            else if (player.isMe) badgeText = "You";

                            return (
                                <View
                                    key={`player-${index}`}
                                    className={`w-[48%] mb-4 p-4 rounded-3xl border ${player.isMe ? 'bg-indigo-600 border-indigo-400' : 'bg-[#111827]/50 border-gray-800'}`}
                                >
                                    <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mb-2">
                                        <Text className="text-white font-[Manrope-Bold]">
                                            {player.name ? player.name.charAt(0).toUpperCase() : "A"}
                                        </Text>
                                    </View>
                                    <Text className="text-white font-[Manrope-Bold]" numberOfLines={1}>
                                        {player.name}
                                    </Text>
                                    <Text className="text-gray-400 text-[10px] font-[Manrope-Medium]">
                                        {badgeText}
                                    </Text>
                                </View>
                            )
                        })}
                    </View>
                </ScrollView>
            </View>

            {/* Footer Status / Start Game Button */}
            <View className="py-6 border-t border-gray-900">
                {isStarting ? (
                    <View className="flex-row items-center justify-center bg-green-500/20 h-16 rounded-2xl border border-green-500/30">
                        <ActivityIndicator size="small" color="#22c55e" className="mr-3" />
                        <Text className="text-green-500 font-[Manrope-Bold] text-lg">Starting Game...</Text>
                    </View>
                ) : isHost ? (
                    <TouchableOpacity onPress={handleStartGame} className="bg-indigo-600 h-16 rounded-2xl flex-row items-center justify-center">
                        <Text className="text-white font-[Manrope-Bold] text-lg mr-2">Start Quiz Now</Text>
                        <Play size={20} color="white" fill="white" />
                    </TouchableOpacity>
                ) : (
                    <View className="flex-row items-center justify-center h-16 bg-[#111827]/50 rounded-2xl border border-gray-800">
                        <Clock size={18} color="#9CA3AF" />
                        <Text className="text-gray-400 font-[Manrope-Medium] ml-3 text-sm">Waiting for host to launch...</Text>
                    </View>
                )}
            </View>

            <CustomAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} onClose={() => setAlertConfig({ visible: false, title: '', message: '' })} />
        </SafeAreaView>
    );
}