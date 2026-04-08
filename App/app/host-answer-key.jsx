import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { ArrowLeft, ListChecks } from 'lucide-react-native';
import { router } from 'expo-router';
import useGameStore from '../store/useGameStore';

export default function HostAnswerKeyScreen() {
    // 🟢 Host ke paas finalReport nahi hota, uske paas seedha quizData hota hai
    const { quizData } = useGameStore();

    // Data nikalna
    const questions = quizData?.questions || [];
    const quizTitle = quizData?.title || quizData?.settings?.title || "Live Quiz";

    return (
        <SafeAreaView className="flex-1 bg-[#020617]">
            {/* 🟢 Clean Header */}
            <View className="flex-row items-center justify-between px-6 py-4 mt-2">
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-800/50 rounded-full">
                    <ArrowLeft color="#FFFFFF" size={24} />
                </TouchableOpacity>
                <Text className="text-white font-[Manrope-Bold] text-lg">
                    Answer Key
                </Text>
                <View className="w-10" /> {/* Balancing space */}
            </View>

            {/* 🟢 Quiz Title Section */}
            <View className="px-6 py-4 mb-2 flex-row items-center">
                <View className="bg-indigo-600/20 p-3 rounded-2xl mr-4">
                    <ListChecks color="#818CF8" size={24} />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-400 font-[Manrope-Medium] text-xs uppercase tracking-widest mb-1">
                        Master Key
                    </Text>
                    <Text className="text-white font-[Manrope-Bold] text-xl" numberOfLines={1}>
                        {quizTitle}
                    </Text>
                </View>
            </View>

            {/* 🟢 Questions List */}
            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {questions.length === 0 ? (
                    <Text className="text-gray-500 text-center font-[Manrope-Medium] mt-10">
                        No questions found in this quiz.
                    </Text>
                ) : (
                    questions.map((item, index) => (
                        <View key={item._id || index} className="bg-[#0F172A] rounded-2xl mb-4 p-5 flex-row relative overflow-hidden border border-gray-800">
                            
                            {/* Blue Side Indicator */}
                            <View className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#5B4CFF]" />
                            
                            <View className="flex-1 pl-2">
                                <Text className="text-gray-400 font-[Manrope-Bold] text-xs uppercase tracking-wider mb-2">
                                    Question {index + 1}
                                </Text>
                                
                                <Text className="text-white font-[Manrope-Medium] text-base mb-4 leading-snug">
                                    {item.questionText}
                                </Text>
                                
                                {/* 🟢 Correct Answer Highlight Box */}
                                <View className="px-4 py-3 rounded-xl border bg-[#064E3B]/30 border-[#059669]/50 flex-row items-center">
                                    <Text className="text-[#34D399] font-[Manrope-Bold] text-sm mr-2">
                                        Answer:
                                    </Text>
                                    <Text className="text-[#34D399] font-[Manrope-Medium] text-sm flex-1">
                                        {item.correctAnswer || "Not specified"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* 🟢 Floating Return to Leaderboard Button */}
            <View className="absolute bottom-6 left-6 right-6">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.back()} // Host wapas Leaderboard par jayega
                    className="w-full bg-[#334155] border border-gray-600 py-4 rounded-2xl items-center flex-row justify-center shadow-lg"
                >
                    <ArrowLeft color="#FFFFFF" size={20} className="mr-2" />
                    <Text className="text-white font-[Manrope-Bold] text-lg">
                        Back to Leaderboard
                    </Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}