import React, { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AppLogo from '../components/AppLogo'; // Apna custom logo component import karo
import '../global.css'; // NativeWind ke liye zaroori CSS import

export default function SplashScreen() {
    const router = useRouter();

    useEffect(() => {
        // 2-3 seconds ka delay taaki user logo dekh sake (Production feel)
        const timer = setTimeout(() => {
            // Yahan hum auth check ka logic bhi daal sakte hain baad mein
            router.replace('/home');
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-[#050B18] justify-between items-center py-10">
            <StatusBar style="light" />

            {/* Center Content: Logo and Title */}
            <View className="flex-1 justify-center items-center">
                <Animated.View entering={FadeInDown.duration(1000).springify()}>
                    {/* SVG Component Use Kar rahe hain */}
                    <AppLogo size={120} />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200).duration(1000)}>
                    <Text className="text-white text-3xl font-[Manrope-Bold] mt-8 tracking-tight">
                        EduQuiz LAN
                    </Text>
                    <Text className="text-gray-400 text-center text-sm font-[Manrope-Regular] mt-2">
                        Learn together, anywhere
                    </Text>
                </Animated.View>
            </View>

            {/* Bottom Content: Loading & Version */}
            <View className="items-center w-full px-10">
                <View className="flex-row items-center mb-8">
                    <ActivityIndicator size="small" color="#00D1FF" />
                    <Text className="text-[#00D1FF] font-[Manrope-SemiBold] text-xs ml-3 tracking-[2px] uppercase">
                        Initializing
                    </Text>
                </View>

                <Text className="text-gray-600 font-[Manrope-Regular] text-xs">
                    v1.0.0
                </Text>
            </View>
        </SafeAreaView>
    );
}