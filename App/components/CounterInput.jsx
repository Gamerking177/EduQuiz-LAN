import React from 'react';
import { View, Text, TextInput } from 'react-native';

const CounterInput = ({ label, value, onChangeText, subLabel }) => {
  
  const handleTextChange = (text) => {
    // 🟢 Sirf numbers rakho
    const numericValue = text.replace(/[^0-9]/g, '');
    
    // Agar user mita de toh empty string bhejo taaki wo type kar sake
    if (onChangeText) {
      onChangeText(numericValue === '' ? '' : parseInt(numericValue, 10));
    }
  };

  return (
    <View className="flex-row items-center justify-between mb-6 p-4 bg-[#050B18] rounded-2xl border border-gray-800">
      
      <View className="flex-1 mr-4">
        <Text className="text-white font-[Manrope-SemiBold] text-base">{label}</Text>
        {subLabel && <Text className="text-gray-400 text-[10px] mt-1 uppercase tracking-tighter">{subLabel}</Text>}
      </View>

      <View className="bg-[#111827] border border-gray-700 rounded-xl w-24 h-12 justify-center">
        <TextInput 
          className="text-white font-[Manrope-Bold] text-lg text-center h-full"
          value={value === 0 || value === '0' ? '' : String(value)} // 🟢 Empty string handle kiya
          onChangeText={handleTextChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#4B5563"
          maxLength={3}
          cursorColor="#8B5CF6"
          selectTextOnFocus={true} 
        />
      </View>
    </View>
  );
};

export default CounterInput;