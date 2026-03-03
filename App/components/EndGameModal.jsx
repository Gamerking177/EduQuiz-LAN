import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, Animated } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

export default function EndGameModal({ isVisible, onClose, onConfirm, isEnding }) {
    // Animation ki state
    const scaleValue = useRef(new Animated.Value(0)).current;

    // Jab bhi isVisible change hoga, animation chalegi
    useEffect(() => {
        if (isVisible) {
            Animated.spring(scaleValue, {
                toValue: 1,
                friction: 6, // Bounce effect
                tension: 40, // Speed
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(scaleValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible]);

    // Smooth close animation function
    const handleClose = () => {
        Animated.timing(scaleValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => onClose()); // Animation ke baad parent ka state false karo
    };

    return (
        <Modal
            transparent={true}
            visible={isVisible}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View className="flex-1 justify-center items-center bg-[#020617]/80 px-6">
                <Animated.View 
                    style={{ transform: [{ scale: scaleValue }] }}
                    className="bg-[#0F172A] w-full rounded-[24px] p-6 border border-gray-700/80 shadow-2xl shadow-black"
                >
                    {/* Warning Icon with Red Glow */}
                    <View className="items-center mb-4">
                        <View className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
                            <AlertTriangle color="#EF4444" size={32} />
                        </View>
                    </View>

                    {/* Texts */}
                    <Text className="text-white text-2xl font-[Manrope-Bold] text-center mb-2">
                        End Session?
                    </Text>
                    <Text className="text-gray-400 font-[Manrope-Medium] text-center text-base mb-8 px-2">
                        Are you sure you want to end this live quiz for everyone? This action cannot be undone.
                    </Text>

                    {/* Action Buttons Row */}
                    <View className="flex-row gap-4">
                        {/* Cancel Button */}
                        <TouchableOpacity 
                            onPress={handleClose}
                            disabled={isEnding}
                            className="flex-1 bg-transparent border-2 border-gray-700 py-4 rounded-[16px] items-center justify-center"
                        >
                            <Text className="text-gray-300 font-[Manrope-Bold] text-lg">Cancel</Text>
                        </TouchableOpacity>

                        {/* Confirm End Button */}
                        <TouchableOpacity 
                            onPress={onConfirm}
                            disabled={isEnding}
                            className="flex-1 bg-[#EF4444] py-4 rounded-[16px] items-center justify-center flex-row shadow-lg shadow-red-500/30"
                        >
                            {isEnding ? (
                                <ActivityIndicator color="white" size="small" className="mr-2" />
                            ) : null}
                            <Text className="text-white font-[Manrope-Bold] text-lg">
                                {isEnding ? "Ending..." : "Yes, End"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}