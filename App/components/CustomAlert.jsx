import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
// 🟢 NAYA: CheckCircle2 import kiya success icon ke liye
import { AlertCircle, CheckCircle2 } from 'lucide-react-native'; 

// 🟢 NAYA: 'type' prop add kiya (default 'error' rahega)
const CustomAlert = ({ visible, title, message, onClose, type = 'error' }) => {
    const isSuccess = type === 'success';

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
                    
                    {/* 🟢 Dynamic Icon Box */}
                    <View className={`p-4 rounded-full mb-4 border ${isSuccess ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        {isSuccess ? (
                            <CheckCircle2 size={32} color="#10b981" /> // Emerald Green
                        ) : (
                            <AlertCircle size={32} color="#ef4444" /> // Red
                        )}
                    </View>

                    {/* Title & Message */}
                    <Text className="text-white font-[Manrope-Bold] text-xl mb-2 text-center">
                        {title || (isSuccess ? "Success!" : "Oops!")}
                    </Text>
                    <Text className="text-gray-400 font-[Manrope-Medium] text-center mb-8 text-sm leading-relaxed">
                        {message}
                    </Text>

                    {/* 🟢 Dynamic Action Button */}
                    <TouchableOpacity 
                        onPress={onClose}
                        className={`w-full h-14 rounded-2xl items-center justify-center ${isSuccess ? 'bg-emerald-600' : 'bg-indigo-600'}`}
                    >
                        <Text className="text-white font-[Manrope-Bold] text-lg">
                            {isSuccess ? 'Awesome!' : 'Theek Hai Bhai'}
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
};

export default CustomAlert;