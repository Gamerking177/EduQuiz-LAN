import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Trophy } from 'lucide-react-native';

import socketService from '../utils/socket';
import useGameStore from '../store/useGameStore';

// Components
import QuestionHeader from '../components/QuestionHeader';
import OptionCard from '../components/OptionCard';

export default function QuestionPanel() {
    const router = useRouter();
    const { roomCode, isHost } = useGameStore();

    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    
    const [timeLeft, setTimeLeft] = useState(30);
    const [qIndex, setQIndex] = useState(0);
    const [totalQs, setTotalQs] = useState(0);
    
    const [isGameOver, setIsGameOver] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    // 🟢 Host Bypass (Commented out taaki Host bhi question dekh sake)
    useEffect(() => {
        if (isHost) {
            router.replace('/host-live-leaderboard'); 
        }
    }, [isHost]);

    // 🟢 Anti-Cheat: Block Back Button
    useEffect(() => {
        const backAction = () => true; 
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    // 🟢 Socket Logic (FIXED: Host return wala logic hata diya)
    useEffect(() => {
        // Yahan se 'if (isHost) return;' hata diya gaya hai!
        // Ab Host ko bhi "new_question" barabar milega.

        socketService.on("new_question", (data) => {
            setCurrentQuestion(data);
            setQIndex(data.qIndex + 1);
            setTotalQs(data.total);
            setTimeLeft(data.timeLimit || 30);
            
            setSelectedOption(null);
            setIsAnswered(false);
        });

        socketService.on("game_over", (data) => {
            setIsGameOver(true);
            setFinalScore(data.finalScore);
        });

        return () => {
            socketService.off("new_question");
            socketService.off("game_over");
        };
    }, [roomCode, isHost]);

    // 🟢 Timer Logic
    useEffect(() => {
        if (isAnswered || isGameOver || !currentQuestion) return;

        if (timeLeft <= 0) {
            // Agar player time pe answer nahi karta toh skip ho jayega
            if (!isHost) {
                handleOptionSelect("__SKIP__"); 
            }
            return;
        }

        const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, isAnswered, currentQuestion, isGameOver, isHost]);

    // 🟢 useCallback taaki Memoized components properly kaam karein
    const handleOptionSelect = useCallback((option) => {
        if (isAnswered || isGameOver || isHost) return; // Host answer submit nahi kar sakta
        
        setSelectedOption(option);
        setIsAnswered(true);

        socketService.submitAnswer(roomCode, option);
    }, [isAnswered, isGameOver, roomCode, isHost]);


    // --- RENDERING VIEWS ---

    if (isGameOver) {
        return (
            <SafeAreaView className="flex-1 bg-[#050B18] items-center justify-center px-6">
                <Trophy size={80} color="#6366f1" className="mb-6" />
                <Text className="text-white font-[Manrope-Bold] text-4xl mb-2">Quiz Finished!</Text>
                <Text className="text-gray-400 font-[Manrope-Medium] text-lg mb-8">Wait for host to end the session</Text>
                
                <View className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[32px] items-center w-full">
                    <Text className="text-indigo-400 font-[Manrope-Bold] uppercase tracking-[4px] text-xs mb-2">Final Score</Text>
                    <Text className="text-white font-[Manrope-Bold] text-7xl">{finalScore}</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!currentQuestion) {
        return (
            <SafeAreaView className="flex-1 bg-[#050B18] items-center justify-center">
                <View className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <Text className="text-indigo-400 font-[Manrope-Bold] text-xl animate-pulse">Loading Question...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#050B18]">
            {/* Header (Question No & Timer) */}
            <QuestionHeader 
                qIndex={qIndex} 
                totalQs={totalQs} 
                timeLeft={timeLeft} 
            />

            <View className="flex-1 px-6 pt-8">
                {/* Question Box */}
                <View className="bg-[#0F172A]/80 border border-gray-800 p-8 rounded-[32px] mb-10 min-h-[160px] justify-center shadow-lg shadow-black/50">
                    <Text className="text-white font-[Manrope-Bold] text-2xl text-left leading-10">
                        {currentQuestion.questionText}
                    </Text>
                </View>

                {/* Options List */}
                <View className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                        <OptionCard 
                            key={`opt-${index}`}
                            option={option}
                            index={index}
                            isSelected={selectedOption === option}
                            isDisabled={isAnswered || isHost} // 🟢 Host ke liye options disable rahenge
                            onPress={handleOptionSelect}
                        />
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}