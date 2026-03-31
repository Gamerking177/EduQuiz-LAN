import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// 🟢 1. SVG Elements ko Animate karne ke liye setup
const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// 🟢 2. Custom Animated Tick Component
const PremiumSuccessTick = () => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const tickAnim = useRef(new Animated.Value(60)).current; // 60 is the dash offset (hidden)

    useEffect(() => {
        // Pehle Bounce hoga, fir Tick draw hoga
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,      // Bounciness
                tension: 50,      // Speed of bounce
                useNativeDriver: true,
            }),
            Animated.timing(tickAnim, {
                toValue: 0,       // 0 means fully drawn
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false, // SVG stroke dashoffset native driver support nahi karta
            })
        ]).start();
    }, []);

    return (
        <AnimatedSvg 
            width={120} 
            height={120} 
            viewBox="0 0 100 100" 
            style={{ transform: [{ scale: scaleAnim }] }}
        >
            {/* Halka Green Background */}
            <Circle cx="50" cy="50" r="40" fill="#22C55E" fillOpacity="0.15" />
            
            {/* Green Border */}
            <Circle cx="50" cy="50" r="40" stroke="#22C55E" strokeWidth="3" fill="none" />
            
            {/* ✨ Animated Tick Path */}
            <AnimatedPath
                d="M32 50 L45 62 L68 38"
                fill="none"
                stroke="#22C55E"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={60}
                strokeDashoffset={tickAnim} // Ye value 60 se 0 tak jayegi animation mein
            />
        </AnimatedSvg>
    );
};

// 🟢 3. Tera Main Popup Component
export default function QuizEndPopup({ visible, onViewResults }) {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            statusBarTranslucent
        >
            <View className="flex-1 justify-center items-center bg-black/80 px-6">
                
                {/* 🎛️ Popup Card */}
                <View className="w-full bg-[#0F172A] rounded-3xl p-6 border border-gray-800 shadow-2xl items-center">
                    
                    {/* ✨ Apna Premium Animation Yahan Call Ho Raha Hai */}
                    <View className="mb-4">
                        <PremiumSuccessTick />
                    </View>

                    {/* 📝 Title & Message */}
                    <Text className="text-white font-[Manrope-Bold] text-3xl text-center mb-2 mt-2">
                        Quiz Completed!
                    </Text>
                    <Text className="text-gray-400 font-[Manrope-Medium] text-base text-center mb-8 px-4">
                        Your answers are locked in. Let's see how you performed!
                    </Text>

                    {/* 🔘 View Results Button */}
                    <TouchableOpacity 
                        activeOpacity={0.8}
                        onPress={onViewResults}
                        className="w-full bg-[#5B4CFF] py-4 rounded-2xl items-center justify-center shadow-[0_4px_14px_rgba(91,76,255,0.4)]"
                    >
                        <Text className="text-white font-[Manrope-Bold] text-lg">
                            View Results
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}