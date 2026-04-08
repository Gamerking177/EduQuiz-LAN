import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, TouchableOpacity } from 'react-native';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';

const CustomToast = ({ visible, message, type = 'info', onHide }) => {
    // Animation Values
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // 🟢 Show Animation (Slide down & Fade in)
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 60, // Screen ke top se kitna neeche aana hai
                    useNativeDriver: true,
                    bounciness: 12,
                    speed: 14
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();

            // 🟢 Auto-Hide after 3 seconds
            const timer = setTimeout(() => {
                hideToast();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideToast = () => {
        // 🔴 Hide Animation (Slide up & Fade out)
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            if (onHide) onHide(); // Animation khatam hone ke baad state update karo
        });
    };

    // UI Configuration based on Toast Type
    const config = {
        success: {
            icon: <CheckCircle2 size={24} color="#4ADE80" />,
            bgColor: "bg-green-500/10",
            borderColor: "border-green-500/30",
            textColor: "text-green-400"
        },
        error: {
            icon: <AlertCircle size={24} color="#EF4444" />,
            bgColor: "bg-red-500/10",
            borderColor: "border-red-500/30",
            textColor: "text-red-400"
        },
        info: {
            icon: <Info size={24} color="#60A5FA" />,
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/30",
            textColor: "text-blue-400"
        }
    };

    const currentConfig = config[type] || config.info;

    // Agar visible false hai aur opacity 0 hai, toh render mat karo (Performance boost)
    if (!visible && opacity._value === 0) return null;

    return (
        <Animated.View
            style={{
                transform: [{ translateY }],
                opacity: opacity,
                position: 'absolute',
                top: 0,
                left: 20,
                right: 20,
                zIndex: 9999, // Sabse upar dikhane ke liye
                elevation: 10,
            }}
        >
            <View className={`flex-row items-center p-4 rounded-2xl border bg-[#0F172A] shadow-2xl shadow-black/50 ${currentConfig.borderColor}`}>
                
                {/* 🟢 Icon Badge */}
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${currentConfig.bgColor}`}>
                    {currentConfig.icon}
                </View>

                {/* 🟢 Message Text */}
                <View className="flex-1">
                    <Text className={`font-[Manrope-Bold] text-base ${currentConfig.textColor}`}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}!
                    </Text>
                    <Text className="text-gray-300 font-[Manrope-Medium] text-sm mt-0.5">
                        {message}
                    </Text>
                </View>

                {/* 🟢 Manual Close Button */}
                <TouchableOpacity onPress={hideToast} className="p-2 -mr-2">
                    <X size={20} color="#6B7280" />
                </TouchableOpacity>

            </View>
        </Animated.View>
    );
};

export default CustomToast;