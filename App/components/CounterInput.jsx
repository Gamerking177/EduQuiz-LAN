import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';

// 🟢 NAYA: onChangeText prop add kiya gaya hai
const CounterInput = ({ label, value, onIncrement, onDecrement, onChangeText, subLabel }) => {
  
  // Input ko handle karne ke liye function (sirf numbers allow karega)
  const handleTextChange = (text) => {
    const numericValue = parseInt(text.replace(/[^0-9]/g, ''), 10);
    
    if (!isNaN(numericValue)) {
      if (onChangeText) onChangeText(numericValue);
    } else if (text === '') {
      if (onChangeText) onChangeText(0); // Agar user sab delete kar de toh 0 set kar do
    }
  };

  return (
    <View className="flex-row items-center justify-between bg-[#111827] p-4 rounded-2xl border border-gray-800 mb-4">
      <View>
        <Text className="text-white font-[Manrope-SemiBold]">{label}</Text>
        {subLabel && <Text className="text-gray-500 text-[10px]">{subLabel}</Text>}
      </View>
      <View className="flex-row items-center bg-[#050B18] rounded-xl border border-gray-700">
        
        <TouchableOpacity onPress={onDecrement} className="p-3">
          <Minus size={16} color="white" />
        </TouchableOpacity>
        
        {/* 🟢 NAYA: Text ki jagah TextInput laga diya */}
        <TextInput 
          className="text-white font-[Manrope-Bold] px-4 text-center min-w-[50px]"
          value={String(value)} 
          onChangeText={handleTextChange}
          keyboardType="numeric"
          maxLength={3} // Max 999 players allowed
          selectTextOnFocus={true} // Tap karte hi purana number select ho jayega overtype karne ke liye
        />
        
        <TouchableOpacity onPress={onIncrement} className="p-3 bg-indigo-600 rounded-r-xl">
          <Plus size={16} color="white" />
        </TouchableOpacity>
        
      </View>
    </View>
  );
};

export default CounterInput;