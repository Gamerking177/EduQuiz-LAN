import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { LogOut, X } from 'lucide-react-native';

const CustomLogoutPopup = ({ visible, onCancel, onConfirm }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel} // Android back button handle karne ke liye
        >
            {/* Dark/Blurry Background Overlay */}
            <View className="flex-1 justify-center items-center bg-black/80 px-6">

                {/* Popup Card */}
                <View className="bg-[#0F172A] w-full border border-gray-800 rounded-3xl p-6 shadow-2xl shadow-black">

                    {/* Top Icon & Close Button */}
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="w-14 h-14 bg-red-500/10 rounded-2xl border border-red-500/20 items-center justify-center">
                            <LogOut size={26} color="#ef4444" />
                        </View>
                        <TouchableOpacity onPress={onCancel} className="p-2 -mr-2 -mt-2">
                            <X size={22} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Text Content */}
                    <Text className="text-white font-[Manrope-Bold] text-2xl mb-2">
                        Ready to leave?
                    </Text>
                    <Text className="text-gray-400 font-[Manrope-Medium] text-sm leading-5 mb-8">
                        Are you sure you want to log out? You will need your Access Key to re-enter the arena.
                    </Text>

                    {/* Action Buttons */}
                    <View className="flex-row justify-between gap-2">
                        {/* Cancel Button (Neutral) */}
                        <TouchableOpacity
                            onPress={onCancel}
                            activeOpacity={0.7}
                            className="flex-1 h-14 rounded-[20px] border border-gray-700 bg-[#111827] items-center justify-center"
                        >
                            <Text className="text-gray-300 font-[Manrope-Bold] text-base tracking-wide">Cancel</Text>
                        </TouchableOpacity>

                        {/* Confirm Button (Danger) */}
                        <TouchableOpacity
                            onPress={onConfirm}
                            activeOpacity={0.7}
                            className="flex-1 h-14 rounded-[20px] bg-red-600 items-center justify-center shadow-lg shadow-red-900/40"
                        >
                            <Text className="text-white font-[Manrope-Bold] text-base tracking-wide">Log Out</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

export default CustomLogoutPopup;