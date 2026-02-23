import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const TimeStepper = ({ selectedTime, onTimeChange }) => {
  const options = ['15s', '30s', '60s'];

  return (
    <View className="mb-6 px-1">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-gray-400 font-[Manrope-Medium] text-sm">Time per Question</Text>
        <Text className="text-indigo-500 font-[Manrope-Bold] text-xs">{selectedTime}</Text>
      </View>
      
      <View className="flex-row bg-[#111827] p-1.5 rounded-3xl border border-gray-800 justify-between">
        {options.map((time) => {
          const isActive = selectedTime === time;
          return (
            <TouchableOpacity
              key={`time-opt-${time}`}
              onPress={() => onTimeChange(time)}
              activeOpacity={0.7}
              className={`flex-1 py-3.5 rounded-2xl items-center justify-center mx-1 ${
                isActive ? 'bg-indigo-600' : 'bg-transparent'
              }`}
            >
              <Text className={`font-[Manrope-Bold] text-xs ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default memo(TimeStepper);