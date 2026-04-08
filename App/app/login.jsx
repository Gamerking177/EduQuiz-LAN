import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API & Components
import { useMutation } from '@tanstack/react-query';
import { loginUser, setAuthToken } from '../utils/api';
import AppLogo from '../components/AppLogo';
import useGameStore from '../store/useGameStore';

// 🟢 1. Naya Custom Toast Import Kiya
import CustomToast from '../components/CustomToast';

export default function LoginScreen() {
    const router = useRouter();
    const setPlayerName = useGameStore((state) => state.setPlayerName);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // 🟢 2. Toast State
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

    // Helper function toast dikhane ke liye
    const showToast = (message, type = 'error') => {
        setToast({ visible: true, message, type });
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        if (text.length === 0) {
            setEmailError(''); 
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(text)) {
                setEmailError('Please enter a valid email address');
            } else {
                setEmailError(''); 
            }
        }
    };

    const handlePasswordChange = (text) => {
        setPassword(text);
        if (text.length === 0) {
            setPasswordError('');
        } else if (text.length < 6) {
            setPasswordError('Access Key must be at least 6 characters long');
        } else {
            setPasswordError('');
        }
    };

    const isFormValid = email.length > 0 && password.length >= 6 && emailError === '' && passwordError === '';

    const getEmailBorder = () => {
        if (!email) return 'border-gray-800';
        if (emailError) return 'border-red-500';
        return 'border-green-500';
    };

    const getPasswordBorder = () => {
        if (!password) return 'border-gray-800';
        if (passwordError) return 'border-red-500';
        return 'border-green-500';
    };

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: async (response) => {
            try {
                const token = response.token;
                setAuthToken(token);
                
                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userData', JSON.stringify(response));

                setPlayerName(response.name); 

                // 🟢 3. Success Toast dikhao aur thoda wait karke redirect karo
                showToast("Access Granted! Entering Arena...", "success");
                
                setTimeout(() => {
                    router.replace('/home');
                }, 800); // 800ms ka mast delay taaki user green toast dekh sake

            } catch (e) {
                showToast("Failed to save secure session.", "error");
            }
        },
        onError: (error) => {
            // 🟢 4. Error aaye toh Red Toast dikhao
            const errorMsg = error.response?.data?.message || "Invalid credentials or network issue.";
            showToast(errorMsg, "error");
        }
    });

    const onSubmit = () => {
        if (isFormValid) {
            loginMutation.mutate({ email: email.toLowerCase(), password });
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#050B18' }}>
            
            {/* 🟢 5. CUSTOM TOAST YAHAN LAGA HAI (Sabse upar) */}
            <CustomToast 
                visible={toast.visible} 
                message={toast.message} 
                type={toast.type} 
                onHide={() => setToast({ ...toast, visible: false })} 
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20} 
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 30, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled" 
                >
                    <View className="absolute top-12 left-6">
                        <Text className="text-white font-[Manrope-Bold] text-lg tracking-wide">EduQuiz LAN</Text>
                    </View>

                    <View className="items-center w-full mt-10">
                        <View className="mb-6"><AppLogo /></View>

                        <Text className="text-white font-[Manrope-Bold] text-4xl mb-3 text-center">Welcome</Text>
                        <Text className="text-gray-400 font-[Manrope-Medium] text-sm mb-12 text-center">
                            Enter your credentials to join the arena
                        </Text>

                        <View className="w-full mb-6">
                            <Text className="text-gray-400 font-[Manrope-Medium] text-sm mb-2 ml-1">Email Address</Text>
                            <View className={`flex-row items-center bg-[#111827]/60 border rounded-2xl px-4 h-16 ${getEmailBorder()}`}>
                                <View className="mr-3"><Mail size={20} color="#9CA3AF" /></View>
                                <TextInput
                                    placeholder="commander@eduquiz.lan"
                                    placeholderTextColor="#4B5563"
                                    className="flex-1 text-white font-[Manrope-Medium] text-base"
                                    onChangeText={handleEmailChange}
                                    value={email}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!loginMutation.isPending}
                                />
                                {email.length > 0 && !emailError && (
                                    <View className="ml-2"><CheckCircle2 size={20} color="#22c55e" /></View>
                                )}
                            </View>
                            {emailError ? (
                                <View className="flex-row items-center mt-2 ml-1">
                                    <View className="mr-1"><AlertCircle size={14} color="#ef4444" /></View>
                                    <Text className="text-red-500 font-[Manrope-Medium] text-xs">{emailError}</Text>
                                </View>
                            ) : null}
                        </View>

                        <View className="w-full mb-2">
                            <Text className="text-gray-400 font-[Manrope-Medium] text-sm mb-2 ml-1">Access Key</Text>
                            <View className={`flex-row items-center bg-[#111827]/60 border rounded-2xl px-4 h-16 ${getPasswordBorder()}`}>
                                <View className="mr-3"><Lock size={20} color="#9CA3AF" /></View>
                                <TextInput
                                    placeholder="••••••••••••"
                                    placeholderTextColor="#4B5563"
                                    className="flex-1 text-white font-[Manrope-Medium] text-base tracking-widest"
                                    onChangeText={handlePasswordChange}
                                    value={password}
                                    secureTextEntry={!isPasswordVisible}
                                    editable={!loginMutation.isPending}
                                />
                                <View className="flex-row items-center">
                                    {password.length >= 6 && !passwordError && (
                                        <View className="mr-2"><CheckCircle2 size={20} color="#22c55e" /></View>
                                    )}
                                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} className="p-1">
                                        {isPasswordVisible ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {passwordError ? (
                                <View className="flex-row items-center mt-2 ml-1">
                                    <View className="mr-1"><AlertCircle size={14} color="#ef4444" /></View>
                                    <Text className="text-red-500 font-[Manrope-Medium] text-xs">{passwordError}</Text>
                                </View>
                            ) : null}
                        </View>

                        <View className="w-full items-end mb-8">
                            <TouchableOpacity disabled={loginMutation.isPending}>
                                <Text className="text-indigo-400/80 font-[Manrope-Medium] text-sm py-2">Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={onSubmit}
                            disabled={!isFormValid || loginMutation.isPending}
                            className={`w-full h-16 rounded-2xl flex-row items-center justify-center 
                            ${(!isFormValid || loginMutation.isPending) ? 'bg-gray-700 opacity-50' : 'bg-[#5A52FF]'}`}
                            style={isFormValid && !loginMutation.isPending ? {
                                shadowColor: '#5A52FF',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.4,
                                shadowRadius: 15,
                                elevation: 8
                            } : {}}
                        >
                            {loginMutation.isPending ? <ActivityIndicator color="white" /> : (
                                <>
                                    <Text className="text-white font-[Manrope-Bold] text-lg tracking-widest mr-2">LOGIN</Text>
                                    <View><ArrowRight size={20} color="white" /></View>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-center mt-12 pb-6">
                        <Text className="text-gray-400 font-[Manrope-Medium] text-sm">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/register')} disabled={loginMutation.isPending}>
                            <Text className="text-[#8B85FF] font-[Manrope-Bold] text-sm">Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}