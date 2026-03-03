import React from 'react';
import { View, Text } from 'react-native';

export default function QuestionHeader({ qIndex, totalQs, timeLeft }) {
    // ✅ FIX: function ko batao ki time ki value aayegi
    const getTimerColorHex = (currentTime) => {
        if (currentTime > 10) return '#4ADE80'; // Green
        if (currentTime > 5) return '#FACC15';  // Yellow
        return '#EF4444'; // Red
    };

    // 🟢 NAYA LOGIC: Seconds ko properly minutes aur seconds me convert karna
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
            {/* Question Counter */}
            <View className="bg-indigo-600/10 px-4 py-2 rounded-full border border-indigo-500/20">
                <Text className="text-indigo-400 font-[Manrope-Bold] text-sm">
                    Question {qIndex} of {totalQs}
                </Text>
            </View>

            {/* Timer */}
            <View className="items-center">
                <Text className="text-gray-500 font-[Manrope-Bold] text-[10px] uppercase tracking-[2px] mb-1">
                    Time Left
                </Text>
                {/* 🟢 Inline style mein color daal diya, ab warning ZINDAGI mein nahi aayegi */}
                <Text
                    key={`timer-q-${qIndex}`}
                    style={{ color: getTimerColorHex() }}
                    className="font-[Manrope-Bold] text-3xl"
                >
                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                </Text>
            </View>
        </View>
    );
}