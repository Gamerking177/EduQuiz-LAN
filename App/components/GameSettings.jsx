import React, { memo } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { Settings, Wifi, WifiOff } from 'lucide-react-native';
import CounterInput from './CounterInput';

const GameSettings = ({ formData, setFormData, addQuestion, removeQuestion, questionsCount }) => {
    
    // Direct state update without complex logic
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <View 
            className="bg-[#111827]/30 border border-gray-800 p-5 rounded-[32px] mb-10"
            style={{ borderStyle: 'solid' }} // Stability fix for CssInterop
        >
            <View className="flex-row items-center mb-6">
                <Settings size={18} color="#6366f1" />
                <Text className="text-white font-[Manrope-Bold] ml-2">Game Settings</Text>
            </View>

            {/* Question Count */}
            <CounterInput 
                label="Question Count" 
                subLabel="Total questions in session" 
                value={formData.questionCount} 
                onIncrement={addQuestion} 
                onDecrement={() => removeQuestion(questionsCount - 1)} 
            />

            {/* Max Players */}
            <CounterInput 
                label="Max Player" 
                subLabel="Total players in session" 
                value={formData.maxPlayers} 
                onIncrement={() => updateField('maxPlayers', formData.maxPlayers + 1)} 
                onDecrement={() => updateField('maxPlayers', Math.max(1, formData.maxPlayers - 1))} 
            />

            {/* 🟢 Question Order - NO MAP, NO DYNAMIC KEYS */}
            <View className="mb-6 px-2">
                <Text className="text-gray-400 font-[Manrope-Bold] text-[10px] uppercase tracking-widest mb-3">
                    Question Order
                </Text>
                <View className="flex-row bg-[#050B18] p-1.5 rounded-2xl border border-gray-800">
                    <TouchableOpacity
                        onPress={() => updateField('questionOrder', 'Sequential')}
                        activeOpacity={0.7}
                        className={`flex-1 py-3 rounded-xl items-center ${
                            formData.questionOrder === 'Sequential' ? 'bg-indigo-600' : ''
                        }`}
                    >
                        <Text className={`font-[Manrope-Bold] text-xs ${
                            formData.questionOrder === 'Sequential' ? 'text-white' : 'text-gray-500'
                        }`}>Sequential</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => updateField('questionOrder', 'Random')}
                        activeOpacity={0.7}
                        className={`flex-1 py-3 rounded-xl items-center ${
                            formData.questionOrder === 'Random' ? 'bg-indigo-600' : ''
                        }`}
                    >
                        <Text className={`font-[Manrope-Bold] text-xs ${
                            formData.questionOrder === 'Random' ? 'text-white' : 'text-gray-500'
                        }`}>Random</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Restrict to WiFi */}
            <View className="flex-row items-center justify-between mb-6 p-4 bg-[#050B18] rounded-2xl border border-gray-800">
                <View className="flex-row items-center flex-1 mr-4">
                    <View className={`p-2 rounded-lg ${formData.restrictToWifi ? 'bg-indigo-500/20' : 'bg-gray-800'}`}>
                        {formData.restrictToWifi ? <Wifi size={20} color="#6366f1" /> : <WifiOff size={20} color="#9CA3AF" />}
                    </View>
                    <View className="ml-3">
                        <Text className="text-white font-[Manrope-SemiBold]">Restrict to WiFi</Text>
                    </View>
                </View>
                <Switch 
                    value={formData.restrictToWifi} 
                    onValueChange={(val) => updateField('restrictToWifi', val)} 
                    trackColor={{ false: '#1f2937', true: '#6366f1' }} 
                />
            </View>

            {/* Late Join */}
            <View className="flex-row items-center justify-between px-2">
                <View>
                    <Text className="text-white font-[Manrope-SemiBold]">Allow Late Join</Text>
                    <Text className="text-gray-500 text-xs">Join after start</Text>
                </View>
                <Switch 
                    value={formData.allowLateJoin} 
                    onValueChange={(val) => updateField('allowLateJoin', val)} 
                    trackColor={{ false: '#1f2937', true: '#6366f1' }} 
                />
            </View>
        </View>
    );
};

export default memo(GameSettings); // 🟢 Memo added to prevent re-render crash