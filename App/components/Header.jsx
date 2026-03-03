import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

export default function Header({ roomCode, onBack }) {
    return (
        <View className="flex-row justify-between items-center px-6 pt-6 pb-2">
            <TouchableOpacity onPress={onBack} className="p-2 -ml-2">
                <ArrowLeft color="white" size={26} />
            </TouchableOpacity>
            <View className="bg-[#1E1B4B]/80 px-4 py-1.5 rounded-full border border-purple-500/40 flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                <Text className="text-purple-300 font-[Manrope-Bold] text-sm tracking-wider">
                    Room: {roomCode}
                </Text>
            </View>
        </View>
    );
}