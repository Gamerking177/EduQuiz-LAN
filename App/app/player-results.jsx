import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { X, Trophy, ShieldCheck, CheckCircle2, XCircle, Home } from 'lucide-react-native';
import { router } from 'expo-router';
import useGameStore from '../store/useGameStore';

export default function PlayerResultsScreen() {
    // Zustand se data pull kar rahe hain
    const { finalReport, playerName, clearStore } = useGameStore();

    // Fallback mein "Player" jayega
    const displayName = playerName || "Player";

    // Data mapping
    const answerReview = finalReport?.reportCard || [];
    const totalQuestions = finalReport?.totalQuestions || answerReview.length || 0;
    const rank = finalReport?.rank || "Pending";

    // 🟢 STATS CALCULATION LOGIC
    const correctAnswers = answerReview.filter(item => item.isCorrect).length;
    const skippedAnswers = answerReview.filter(item => item.selectedOption === "Skipped").length;
    // Jo correct nahi hain aur skipped bhi nahi hain, wo wrong hain
    const wrongAnswers = answerReview.length - correctAnswers - skippedAnswers;

    const handleReturnHome = () => {
        clearStore(); // Home jane se pehle purana session saaf kar do
        router.replace('/home');
    };

    return (
        <SafeAreaView className="flex-1 bg-[#020617]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 mt-2">
                <TouchableOpacity onPress={handleReturnHome} className="p-2">
                    <X color="#FFFFFF" size={24} />
                </TouchableOpacity>
                <Text className="text-white font-[Manrope-Bold] text-lg">
                    {displayName}'s Quiz Report
                </Text>
                <View className="w-8" />
            </View>

            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Score Card */}
                <View className="mt-4 p-6 rounded-[30px] bg-[#0F172A] border border-[#5B4CFF]/30 items-center w-full">
                    <View className="flex-row items-center px-4 py-1.5 bg-[#3B0764]/50 rounded-full mb-4">
                        <View className="w-2 h-2 rounded-full bg-[#A855F7] mr-2" />
                        <Text className="text-[#A855F7] font-[Manrope-Bold] text-xs uppercase tracking-widest">
                            Results Finalized
                        </Text>
                    </View>

                    {/* Main Big Score */}
                    <View className="items-center relative mb-6">
                        <View className="absolute opacity-10 top-[-10px]">
                            <Trophy color="#FFFFFF" size={80} />
                        </View>

                        <View className="flex-row items-baseline z-10">
                            <Text className="text-6xl text-[#A855F7] font-[Manrope-Bold]">
                                {correctAnswers}
                            </Text>
                            <Text className="text-3xl text-gray-500 font-[Manrope-Bold]">
                                /{totalQuestions}
                            </Text>
                        </View>
                        <Text className="text-gray-400 font-[Manrope-Medium] text-sm mt-1">
                            Total Score
                        </Text>
                    </View>

                    {/* 🟢 NAYA: Detailed Stats Row (Correct | Wrong | Skipped) */}
                    {/* 🟢 UPDATED: Detailed Stats Row with gap-3 (Correct | Wrong | Skipped) */}
                    <View className="flex-row w-full gap-3 mb-4 mt-2">

                        {/* Correct Box */}
                        <View className="flex-1 bg-[#064E3B]/40 border border-[#059669]/50 py-3 rounded-2xl items-center">
                            <Text className="text-[#34D399] font-[Manrope-Bold] text-xs uppercase tracking-wider mb-1">Correct</Text>
                            <Text className="text-[#10B981] font-[Manrope-Bold] text-2xl">{correctAnswers}</Text>
                        </View>

                        {/* Wrong Box */}
                        <View className="flex-1 bg-[#7F1D1D]/40 border border-[#E11D48]/50 py-3 rounded-2xl items-center">
                            <Text className="text-[#F87171] font-[Manrope-Bold] text-xs uppercase tracking-wider mb-1">Wrong</Text>
                            <Text className="text-[#EF4444] font-[Manrope-Bold] text-2xl">{wrongAnswers}</Text>
                        </View>

                        {/* Skipped Box */}
                        <View className="flex-1 bg-[#713F12]/40 border border-[#CA8A04]/50 py-3 rounded-2xl items-center">
                            <Text className="text-[#FBBF24] font-[Manrope-Bold] text-xs uppercase tracking-wider mb-1">Skipped</Text>
                            <Text className="text-[#EAB308] font-[Manrope-Bold] text-2xl">{skippedAnswers}</Text>
                        </View>

                    </View>

                    <View className="bg-gray-800/60 px-5 py-2.5 rounded-full mt-2 flex-row items-center">
                        <Text className="text-gray-300 font-[Manrope-Medium] text-sm mr-1">Rank:</Text>
                        <Text className="text-[#FACC15] font-[Manrope-Bold] text-sm">{rank}</Text>
                        <Text className="text-gray-400 font-[Manrope-Medium] text-sm ml-1">(Waiting for others)</Text>
                    </View>
                </View>

                {/* Answer Review Section */}
                <View className="mt-8 mb-4 flex-row items-center">
                    <ShieldCheck color="#A855F7" size={22} />
                    <Text className="text-white font-[Manrope-Bold] text-xl ml-2">
                        Answer Review
                    </Text>
                </View>

                {/* List Mapping */}
                {answerReview.length === 0 ? (
                    <Text className="text-gray-500 text-center font-[Manrope-Medium] mt-4">Waiting for answers data...</Text>
                ) : (
                    answerReview.map((item, index) => {
                        const isCorrect = item.isCorrect;
                        const isSkipped = item.selectedOption === "Skipped";

                        const iconColor = isCorrect ? "#22C55E" : (isSkipped ? "#FACC15" : "#EF4444");
                        const answerBg = isCorrect ? "bg-[#064E3B]/30" : (isSkipped ? "bg-[#713F12]/30" : "bg-[#7F1D1D]/30");
                        const answerBorder = isCorrect ? "border-[#059669]/50" : (isSkipped ? "border-[#CA8A04]/50" : "border-[#E11D48]/50");
                        const answerText = isCorrect ? "text-[#34D399]" : (isSkipped ? "text-[#FBBF24]" : "text-[#F87171]");
                        const sideBarColor = isCorrect ? "bg-green-500" : (isSkipped ? "bg-yellow-500" : "bg-red-500");

                        return (
                            <View key={`q-${item.qIndex || index}`} className="bg-[#0F172A] rounded-2xl mb-4 p-5 flex-row relative overflow-hidden border border-gray-800">
                                <View className={`absolute left-0 top-0 bottom-0 w-1.5 ${sideBarColor}`} />
                                <View className="mr-4 mt-1">
                                    {isCorrect ? <CheckCircle2 color={iconColor} size={24} /> : <XCircle color={iconColor} size={24} />}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 font-[Manrope-Bold] text-xs uppercase tracking-wider mb-1">
                                        Question {(item.qIndex || index) + 1}
                                    </Text>
                                    <Text className="text-white font-[Manrope-Medium] text-base mb-3 leading-snug">
                                        {item.questionText}
                                    </Text>
                                    <View className={`px-4 py-3 rounded-xl border ${answerBg} ${answerBorder}`}>
                                        <Text className={`${answerText} font-[Manrope-Medium] text-sm`}>
                                            Your Answer: {item.selectedOption}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Floating Return to Home Button */}
            <View className="absolute bottom-6 left-6 right-6">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleReturnHome}
                    className="w-full bg-[#5B4CFF] py-4 gap-2 rounded-2xl items-center flex-row justify-center shadow-[0_4px_20px_rgba(91,76,255,0.4)]"
                >
                    <Home color="#FFFFFF" size={20} className="mr-2" />
                    <Text className="text-white font-[Manrope-Bold] text-lg">
                        Return to Home
                    </Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}