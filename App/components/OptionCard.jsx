import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

export default function OptionCard({ option, index, isSelected, isDisabled, onPress }) {
    // Standard A, B, C, D dikhane ke liye logic
    const letters = ['A', 'B', 'C', 'D'];
    
    // 🟢 NAYA LOGIC: True / False ke liye Smart Check
    let displayLetter = letters[index] || '-';
    
    // Agar option string hai aur usme True/False likha hai
    if (typeof option === 'string') {
        const lowerOpt = option.toLowerCase();
        if (lowerOpt === 'true') displayLetter = 'T';
        if (lowerOpt === 'false') displayLetter = 'F';
    } else if (typeof option === 'boolean') {
        // In case backend boolean true/false bhej raha ho
        displayLetter = option ? 'T' : 'F';
    }

    // Option text ko display karne ke liye string mein convert kar liya (for safety)
    const optionText = String(option);

    return (
        <TouchableOpacity 
            onPress={() => onPress(option)}
            disabled={isDisabled}
            className={`flex-row items-center p-5 rounded-[24px] border-2 mb-3
                ${isSelected 
                    ? 'bg-indigo-600 border-indigo-400' 
                    : isDisabled 
                        ? 'bg-[#111827]/30 border-gray-800' 
                        : 'bg-[#111827] border-gray-800'
                }
            `}
        >
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 
                ${isSelected ? 'bg-white/20' : 'bg-gray-800'}`}
            >
                <Text className={`font-[Manrope-Bold] text-lg ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                    {displayLetter}
                </Text>
            </View>
            <Text className={`flex-1 font-[Manrope-SemiBold] text-lg ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                {optionText}
            </Text>
        </TouchableOpacity>
    );
}