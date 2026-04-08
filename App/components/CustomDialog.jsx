import React from 'react';
import { Modal, View, Text, TouchableOpacity, Animated } from 'react-native';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react-native';

export default function CustomDialog({ 
    visible, 
    title, 
    message, 
    type = "info", // 'success', 'error', 'warning', 'info'
    onClose,
    confirmText = "Okay"
}) {
    if (!visible) return null;

    // Type ke hisaab se color aur icon decide karna
    const getConfig = () => {
        switch (type) {
            case 'error':
                return { color: '#EF4444', bg: 'bg-red-500/10', border: 'border-red-500/50', icon: <AlertTriangle color="#EF4444" size={28} /> };
            case 'success':
                return { color: '#22C55E', bg: 'bg-green-500/10', border: 'border-green-500/50', icon: <CheckCircle color="#22C55E" size={28} /> };
            case 'warning':
                return { color: '#FACC15', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', icon: <AlertTriangle color="#FACC15" size={28} /> };
            default:
                return { color: '#818CF8', bg: 'bg-indigo-500/10', border: 'border-indigo-500/50', icon: <Info color="#818CF8" size={28} /> };
        }
    };

    const config = getConfig();

    return (
        <Modal transparent={true} visible={visible} animationType="fade">
            {/* Dark Overlay Background */}
            <View className="flex-1 justify-center items-center bg-black/70 px-6">
                
                {/* Dialog Box */}
                <View className="w-full bg-[#0F172A] border border-gray-800 rounded-[32px] p-6 shadow-2xl overflow-hidden">
                    
                    {/* Top Glow Effect */}
                    <View className={`absolute top-0 left-0 right-0 h-1 ${config.bg} ${config.border} border-t`} />

                    {/* Header & Icon */}
                    <View className="flex-row justify-between items-start mb-4">
                        <View className={`p-3 rounded-2xl ${config.bg} border ${config.border}`}>
                            {config.icon}
                        </View>
                        <TouchableOpacity onPress={onClose} className="p-2 bg-gray-800/50 rounded-full">
                            <X color="#9CA3AF" size={20} />
                        </TouchableOpacity>
                    </View>

                    {/* Text Content */}
                    <Text className="text-white font-[Manrope-Bold] text-2xl mb-2">
                        {title}
                    </Text>
                    <Text className="text-gray-400 font-[Manrope-Medium] text-sm leading-6 mb-8">
                        {message}
                    </Text>

                    {/* Action Button */}
                    <TouchableOpacity 
                        onPress={onClose}
                        className={`w-full py-4 rounded-2xl items-center border ${config.border}`}
                        style={{ backgroundColor: config.color }}
                    >
                        <Text className="text-[#020617] font-[Manrope-Bold] text-lg">
                            {confirmText}
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}