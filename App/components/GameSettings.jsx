import React, { memo, useCallback } from 'react';
import { View, Text, Switch, TextInput } from 'react-native';
import { Settings, Wifi, WifiOff, Clock } from 'lucide-react-native'; // 🟢 FIX: Clock icon import kiya
import CounterInput from './CounterInput';
import SegmentedToggle from './SegmentedToggle';
// 🟢 FIX: TimeStepper hata diya

const QUESTION_ORDER_OPTIONS = [
    { id: "sequential", label: "Sequential" },
    { id: "random", label: "Random" }
]

const GameSettings = ({ formData, setFormData }) => {

    // 🟢 updateField stable reference
    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, [setFormData]);

    return (
        <View
            className="bg-[#111827]/30 border border-gray-800 p-5 rounded-[32px] mb-10"
            style={{ borderStyle: 'solid' }}
        >
            <View className="flex-row items-center mb-6">
                <Settings size={18} color="#6366f1" />
                <Text className="text-white font-[Manrope-Bold] ml-2">Game Settings</Text>
            </View>

            {/* Max Players */}
            <CounterInput
                label="Max Player"
                subLabel="Total players in session"
                value={formData.maxPlayers}
                onIncrement={() => updateField('maxPlayers', formData.maxPlayers + 1)}
                onDecrement={() => updateField('maxPlayers', Math.max(1, formData.maxPlayers - 1))}
                onChangeText={(val) => updateField('maxPlayers', val)}
            />

            <SegmentedToggle
                label="Question Order"
                options={QUESTION_ORDER_OPTIONS}
                selectedValue={formData.questionOrder}
                onSelect={(val) => updateField('questionOrder', val)}
            />

            {/* 🟢 NAYA FIX: Custom Total Time Input */}
            <View className="flex-row items-center justify-between mb-6 p-4 bg-[#050B18] rounded-2xl border border-gray-800">
                <View className="flex-row items-center flex-1 mr-4">
                    <View className="p-2 rounded-lg bg-indigo-500/20">
                        <Clock size={20} color="#6366f1" />
                    </View>
                    <View className="ml-3">
                        <Text className="text-white font-[Manrope-SemiBold]">Total Time (Mins)</Text>
                        <Text className="text-gray-500 text-xs">For the entire quiz</Text>
                    </View>
                </View>
                {/* User Input field for minutes */}
                <TextInput
                    className="text-white font-[Manrope-Bold] text-lg bg-[#111827] px-4 py-2 rounded-xl border border-gray-700 text-center w-20"
                    keyboardType="numeric"
                    placeholder="15"
                    placeholderTextColor="#4B5563"
                    value={String(formData.totalTimeLimit || '')}
                    onChangeText={(val) => {
                        // Sirf numbers allow karega
                        const numericValue = val.replace(/[^0-9]/g, '');
                        updateField('totalTimeLimit', numericValue);
                    }}
                    maxLength={3} // Max 999 mins
                />
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
                    thumbColor="#f4f3f4"
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
                    thumbColor="#f4f3f4"
                />
            </View>
        </View>
    );
};

export default memo(GameSettings);