import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

/**
 * Production-Ready ActionCard Component
 * States Handled: Default, Press (ActiveOpacity)
 */
const ActionCard = ({ title, desc, icon: Icon, colorClass, delay, onPress }) => {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(600)}>
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.7}
        // Focus/Filled state is handled by touch feedback and border consistency
        className="bg-[#111827] border border-gray-800 p-6 rounded-[32px] mb-4 flex-row items-center justify-between shadow-sm active:border-gray-600"
      >
        <View className="flex-1 mr-4">
          {/* Icon Container with Dynamic Color */}
          <View className={`${colorClass} w-12 h-12 rounded-full items-center justify-center mb-4 shadow-lg`}>
            {Icon && <Icon size={24} color="white" />}
          </View>
          
          {/* Text Content */}
          <Text className="text-white text-2xl font-[Manrope-Bold] tracking-tight">
            {title}
          </Text>
          <Text className="text-gray-400 font-[Manrope-Regular] mt-1 leading-5">
            {desc}
          </Text>
        </View>

        {/* Right Arrow Indicator */}
        <ChevronRight size={24} color="#374151" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ActionCard;