import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const SegmentedToggle = ({ label, options, selectedValue, onSelect }) => {
    return (
        <View className="mb-6 px-2">
            <Text className="text-gray-400 font-[Manrope-Bold] text-[10px] uppercase tracking-widest mb-3">
                {label}
            </Text>
            <View className="flex-row bg-[#050B18] p-1.5 rounded-2xl border border-gray-800">
                {/* 🟢 NAYA: ab option ek object hai { id, label } */}
                {options.map((option) => {
                    const isSelected = selectedValue === option.id; // Compare id
                    return (
                        <TouchableOpacity
                            key={option.id} // Key bhi id hogi
                            onPress={() => onSelect(option.id)} // Select karne par id pass hogi
                            activeOpacity={0.7}
                            className={`flex-1 py-3 rounded-xl items-center ${isSelected ? 'bg-indigo-600' : ''}`}
                        >
                            <Text className={`font-[Manrope-Bold] text-xs ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                {option.label} {/* UI par Label dikhega */}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default SegmentedToggle;