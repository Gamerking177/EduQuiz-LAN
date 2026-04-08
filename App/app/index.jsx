import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 🟢 Storage import kiya

import AppLogo from '../components/AppLogo'; 
import '../global.css'; 

// 🟢 API aur Store imports auto-login ke liye
import { setAuthToken } from '../utils/api';
import useGameStore from '../store/useGameStore';

export default function SplashScreen() {
    const router = useRouter();
    // 🟢 Zustand store se naam set karne ka function
    const setPlayerName = useGameStore((state) => state.setPlayerName);

    useEffect(() => {
        const checkSessionAndNavigate = async () => {
            try {
                // Storage check karo
                const token = await AsyncStorage.getItem('userToken');
                const userDataString = await AsyncStorage.getItem('userData');

                if (token && userDataString) {
                    // Agar purana session mila, toh usko restore karo
                    setAuthToken(token);
                    const userData = JSON.parse(userDataString);
                    if (userData?.name) {
                        setPlayerName(userData.name);
                    }
                    // Seedha Home par bhejo
                    router.replace('/home');
                } else {
                    // Naya user hai, Login par bhejo
                    router.replace('/login');
                }
            } catch (error) {
                console.error("Session check error:", error);
                router.replace('/login');
            }
        };

        // 🟢 3 seconds ka delay taaki user tera mast logo aur animation dekh sake
        const timer = setTimeout(() => {
            checkSessionAndNavigate(); // 3 second baad check aur navigate hoga
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-[#050B18] justify-between items-center py-10">
            <StatusBar style="light" />

            {/* Center Content: Logo and Title */}
            <View className="flex-1 justify-center items-center">
                <Animated.View entering={FadeInDown.duration(1000).springify()}>
                    <AppLogo size={120} />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200).duration(1000)}>
                    <Text className="text-white text-3xl font-[Manrope-Bold] mt-8 tracking-tight text-center">
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