import React from 'react';
import { View, Text } from 'react-native';

export default function QuestionHeader({ qIndex, totalQs, timeLeft }) {
    // 🟢 FIX: Function ab timeLeft accept karega aur uske hisaab se color dega
    const getTimerColorHex = (currentTime) => {
        // totalDuration ke hisaab se minutes mein khelna hoga
        // Agar 2 minute (120s) se zyada hai toh Green, 1 min (60s) bacha hai toh Yellow, warna Red
        if (currentTime > 120) return '#4ADE80'; // Green
        if (currentTime > 60) return '#FACC15';  // Yellow
        return '#EF4444'; // Red
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800">
            <View className="bg-indigo-600/10 px-4 py-2 rounded-full border border-indigo-500/20">
                <Text className="text-indigo-400 font-[Manrope-Bold] text-sm">
                    Question {qIndex} of {totalQs}
                </Text>
            </View>

            <View className="items-center">
                <Text className="text-gray-500 font-[Manrope-Bold] text-[10px] uppercase tracking-[2px] mb-1">
                    Time Left
                </Text>
                <Text
                    style={{ color: getTimerColorHex(timeLeft) }} // 🟢 FIX: timeLeft pass kiya
                    className="font-[Manrope-Bold] text-3xl"
                >
                    {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                </Text>
            </View>
        </View>
    );
}