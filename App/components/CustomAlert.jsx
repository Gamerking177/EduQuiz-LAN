import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle } from 'lucide-react-native'; // Warning icon

const CustomAlert = ({ visible, title, message, onClose }) => {
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            {/* Dark Overlay */}
            <View className="flex-1 justify-center items-center bg-black/70 px-6">
                
                {/* Alert Box */}
                <View className="bg-[#111827] border border-gray-800 w-full rounded-[32px] p-6 items-center shadow-2xl shadow-indigo-500/20">
                    
                    {/* Icon */}
                    <View className="bg-red-500/10 p-4 rounded-full mb-4 border border-red-500/20">
                        <AlertCircle size={32} color="#ef4444" />
                    </View>

                    {/* Title & Message */}
                    <Text className="text-white font-[Manrope-Bold] text-xl mb-2 text-center">
                        {title || "Oops!"}
                    </Text>
                    <Text className="text-gray-400 font-[Manrope-Medium] text-center mb-8 text-sm leading-relaxed">
                        {message}
                    </Text>

                    {/* Action Button */}
                    <TouchableOpacity 
                        onPress={onClose}
                        className="w-full bg-indigo-600 h-14 rounded-2xl items-center justify-center"
                    >
                        <Text className="text-white font-[Manrope-Bold] text-lg">Theek Hai Bhai</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
};

export default CustomAlert;