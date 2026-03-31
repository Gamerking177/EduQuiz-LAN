import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StopCircle, Home } from 'lucide-react-native';

// 🟢 Tere Custom Store aur Socket Imports
import useGameStore from '../store/useGameStore'; // Path check kar lena
import socketInstance from '../utils/socket'; // Path check kar lena
import Header from '../components/Header';
import PlayerCard from '../components/PlayerGrid';
import StatsGrid from '../components/StatsGrid';
import EndGameModal from '../components/EndGameModal';

// Tere UI Components (Jo humne pehle alag kiye the)

export default function HostLiveLeaderboard() {
    const router = useRouter();

    // 🟢 Zustand Store se Real Data nikal rahe hain
    const { roomCode, quizData, players, setPlayers, clearStore } = useGameStore();

    // Local state load spinner ke liye
    const [isModalVisible, setModalVisible] = useState(false);
    const [isEnding, setIsEnding] = useState(false);

    // 🟢 Derived Data (Store se calculate kiya hua)
    // Agar api se quizData.questions nahi aaya hai, toh fallback 30 denge
    const totalQuestions = quizData?.totalQuestions || 30;
    const quizTitle = quizData?.title || 'Live Quiz Session';
    useEffect(() => {
        // 1. Socket Connect ensure karo (Waise lobby me hi ho gaya hoga)
        socketInstance.connect();

        // 2. 📡 LIVE LISTENER: Jab koi player answer dega, backend se nayi list aayegi
        const handleLeaderboardUpdate = (updatedPlayersList) => {
            console.log("📊 Leaderboard Updated:", updatedPlayersList);

            // Backend se aayi hui list ko score ke hisaab se sort karke Rank dena
            const sortedPlayers = updatedPlayersList
                .sort((a, b) => b.correct - a.correct) // Descending order
                .map((player, index) => ({
                    ...player,
                    rank: index + 1, // Dynamic Rank (1, 2, 3...)
                    // Hum assume kar rahe hain backend currentQ aur isFinished bhejega
                }));

            // 🟢 Zustand store ko update kar do (UI apne aap re-render hoga!)
            setPlayers(sortedPlayers);
        };

        // Listen for the event (Tujhe apne backend pe ye event emit karna hoga)
        socketInstance.on("update_leaderboard", handleLeaderboardUpdate);

        // Cleanup: Screen leave karte waqt listener hata do
        return () => {
            socketInstance.off("update_leaderboard");
        };
    }, []);

    // 🔴 Actual End Game Logic (Jab Modal mein 'Yes, End' dabega)
    const handleConfirmEnd = () => {
        // 1. Agar pehle se end ho raha hai, toh dubara click hone se roko
        if (isEnding) return;

        setIsEnding(true);

        // 2. Tere socket helper ka use karke backend ko batao
        socketInstance.emit("end_quiz_session", { roomCode });

        // 3. Pehle Modal ko hide karo
        setModalVisible(false);

        // 4. Modal ka fade animation (lagbhag 300ms) khatam hone ke baad route change karo
        setTimeout(() => {
            clearStore();
            // router.replace use kar rahe hain taaki back dabane par wapas is screen par na aaye
            router.replace('/home');
        }, 500);
    };

    return (
        <LinearGradient
            colors={['#0F172A', '#020617']}
            className="flex-1"
        >
            <SafeAreaView className="flex-1">
                {/* 🧩 Header Component */}
                <Header roomCode={roomCode || "WAIT..."} onBack={() => router.back()} />

                {/* Titles */}
                <View className="px-6 mt-8 mb-2">
                    <Text className="text-white text-[34px] font-[Manrope-Bold] mb-1" numberOfLines={1}>
                        {quizTitle}
                    </Text>
                    <Text className="text-gray-300 text-[32px] font-[Manrope-Bold]">
                        Current Standings
                    </Text>
                </View>

                {/* 🧩 Stats Grid */}
                <StatsGrid
                    playerCount={players.length}
                    totalQuestions={totalQuestions}
                />

                <Text className="text-gray-400 font-[Manrope-Medium] tracking-widest uppercase text-sm px-6 mt-8 mb-4">
                    CURRENT STANDINGS
                </Text>

                {/* 🧩 Leaderboard List */}
                <ScrollView
                    className="flex-1 px-6"
                    contentContainerStyle={{ paddingBottom: 160 }}
                    showsVerticalScrollIndicator={false}
                >
                    {players.length === 0 ? (
                        <View className="items-center mt-10">
                            <ActivityIndicator size="large" color="#5B4CFF" />
                            <Text className="text-gray-500 font-[Manrope-Medium] mt-4">
                                Waiting for players data...
                            </Text>
                        </View>
                    ) : (
                        // 🟢 FIX: index ko map mein add kiya aur key ko bulletproof banaya
                        players.map((player, index) => (
                            <PlayerCard
                                key={player.id ? `player-${player.id}` : `player-fallback-${index}`}
                                player={player}
                                totalQuestions={totalQuestions} // 🟢 Isse wo 'Q 1/40' wala total display hoga
                            />
                        ))
                    )}
                </ScrollView>

                {/* Bottom Fixed Buttons */}
                <View className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-8 bg-[#020617]/95">
                    <LinearGradient
                        colors={['transparent', '#020617']}
                        className="absolute -top-10 left-0 right-0 h-10"
                    />

                    {/* Yahan hum sirf setModalVisible(true) call karenge */}
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        disabled={isEnding}
                        className="bg-[#5B4CFF] flex-row items-center justify-center py-[18px] rounded-[16px] mb-4"
                    >
                        <View className="mr-3">
                            <StopCircle color="white" size={24} />
                        </View>
                        <Text className="text-white font-[Manrope-Bold] text-xl">End Game</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        // 🟢 FIX: Back dabane par bhi pehle confirm karo ki kya sacchi game end karna hai?
                        onPress={() => setModalVisible(true)}
                        className="bg-transparent border-2 border-[#5B4CFF]/60 flex-row items-center justify-center py-[18px] rounded-[16px]"
                    >
                        <View className="mr-3">
                            <Home color="white" size={24} />
                        </View>
                        <Text className="text-white font-[Manrope-Bold] text-xl">Back to Home</Text>
                    </TouchableOpacity>
                </View>
                <EndGameModal
                    isVisible={isModalVisible}
                    onClose={() => setModalVisible(false)}
                    onConfirm={handleConfirmEnd}
                    isEnding={isEnding}
                />
            </SafeAreaView>
        </LinearGradient>
    );
}