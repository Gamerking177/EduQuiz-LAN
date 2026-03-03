import React from 'react';
import { View, Text } from 'react-native';
import { Users, BookOpen } from 'lucide-react-native';

export default function StatsGrid({ playerCount, totalQuestions }) {
    return (
        <View className="flex-row px-6 mt-8 gap-4">
            <View className="flex-1 bg-[#1E1B4B]/40 rounded-[20px] py-6 items-center border border-gray-800/80">
                <Text className="text-white text-[36px] font-[Manrope-Bold] mb-2">{playerCount}</Text>
                <View className="flex-row items-center justify-center">
                    <View className="mr-2 mt-0.5">
                        <Users color="#A855F7" size={16} />
                    </View>
                    <Text className="text-purple-300 text-[13px] font-[Manrope-Bold] tracking-[0.15em] uppercase">
                        Players
                    </Text>
                </View>
            </View>
            <View className="flex-1 bg-[#1E1B4B]/40 rounded-[20px] py-6 items-center border border-gray-800/80">
                <Text className="text-white text-[36px] font-[Manrope-Bold] mb-2">{totalQuestions}</Text>
                <View className="flex-row items-center justify-center">
                    <View className="mr-2 mt-0.5">
                        <BookOpen color="#A855F7" size={16} />
                    </View>
                    <Text className="text-purple-300 text-[13px] font-[Manrope-Bold] tracking-[0.15em] uppercase">
                        Questions
                    </Text>
                </View>
            </View>
        </View>
    );
}