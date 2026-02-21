import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus, Minus } from 'lucide-react-native';

const CounterInput = ({ label, value, onIncrement, onDecrement, subLabel }) => (
  <View className="flex-row items-center justify-between bg-[#111827] p-4 rounded-2xl border border-gray-800 mb-4">
    <View>
      <Text className="text-white font-[Manrope-SemiBold]">{label}</Text>
      {subLabel && <Text className="text-gray-500 text-[10px]">{subLabel}</Text>}
    </View>
    <View className="flex-row items-center bg-[#050B18] rounded-xl border border-gray-700">
      <TouchableOpacity onPress={onDecrement} className="p-3"><Minus size={16} color="white" /></TouchableOpacity>
      <Text className="text-white font-[Manrope-Bold] px-4">{value}</Text>
      <TouchableOpacity onPress={onIncrement} className="p-3 bg-indigo-600 rounded-r-xl"><Plus size={16} color="white" /></TouchableOpacity>
    </View>
  </View>
);

export default CounterInput;