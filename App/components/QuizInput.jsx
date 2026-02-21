import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';

const QuizInput = ({ label, placeholder, multiline = false, value, onChangeText, error }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-5">
      <Text className="text-gray-400 font-[Manrope-Medium] mb-2 text-sm">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor="#4B5563"
        multiline={multiline}
        className={`bg-[#111827] text-white p-4 rounded-xl border font-[Manrope-Regular] 
          ${isFocused ? 'border-indigo-500' : error ? 'border-red-500' : 'border-gray-800'}
          ${multiline ? 'h-28 textAlignVertical-top' : 'h-14'}`}
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
};

export default QuizInput;