import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API & Components
import { useMutation } from '@tanstack/react-query';
import { registerUser, setAuthToken } from '../utils/api';
import CustomAlert from '../components/CustomAlert';

export default function RegisterScreen() {
    const router = useRouter();
    
    // 🟢 Pure React States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' });

    const showAlert = (title, message, type = 'error') => {
        setAlertConfig({ visible: true, title, message, type });
    };

    // 🟢 Custom Real-Time Validators
    const handleNameChange = (text) => {
        setName(text);
        if (text.length === 0) {
            setNameError(''); 
        } else if (text.length < 2) {
            setNameError('Name must be at least 2 characters long');
        } else if (!/^[a-zA-Z\s]+$/.test(text)) {
            setNameError('Name can only contain letters and spaces');
        } else {
            setNameError(''); 
        }
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

    const isFormValid = 
        name.length >= 2 && 
        email.length > 0 && 
        password.length >= 6 && 
        nameError === '' && 
        emailError === '' && 
        passwordError === '';

    const getNameBorder = () => {
        if (!name) return 'border-gray-800';
        if (nameError) return 'border-red-500';
        return 'border-green-500';
    };

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

    // 🟢 REGISTER MUTATION
    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: async (response) => {
            try {
                const token = response.token;
                setAuthToken(token);
                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userData', JSON.stringify(response));

                console.log("🔥 Registration Success!");
                router.replace('/home');
            } catch (e) {
                showAlert("System Error", "Failed to save secure session.", "error");
            }
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.message || "Registration failed. Email might already exist.";
            showAlert("Registration Failed", errorMsg, "error");
        }
    });

    const onSubmit = () => {
        if (isFormValid) {
            const finalData = {
                name: name,
                email: email.toLowerCase(),
                password: password
            };
            registerMutation.mutate(finalData);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#050B18' }}>
            <View className="flex-row items-center px-6 pt-4 pb-2">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft color="#E5E7EB" size={24} />
                </TouchableOpacity>
                <Text className="text-white font-[Manrope-Bold] text-lg ml-2">Create Account</Text>
            </View>

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
                    <Text className="text-white font-[Manrope-Bold] text-[40px] leading-[48px] mb-3">
                        Join the <Text className="text-[#A855F7]">Arena</Text>
                    </Text>
                    <Text className="text-gray-400 font-[Manrope-Medium] text-base mb-10 leading-6">
                        Step into the future of competitive learning and dominate the leaderboard.
                    </Text>

                    <View className="w-full mb-6">
                        <Text className="text-gray-400 font-[Manrope-Bold] text-xs uppercase tracking-wider mb-2 ml-1">Full Name</Text>
                        <View className={`flex-row items-center bg-[#111827]/60 border rounded-2xl px-4 h-[60px] ${getNameBorder()}`}>
                            <View className="mr-3"><User size={20} color="#9CA3AF" /></View>
                            <TextInput
                                placeholder="Enter your full name"
                                placeholderTextColor="#4B5563"
                                className="flex-1 text-white font-[Manrope-Medium] text-base"
                                onChangeText={handleNameChange}
                                value={name}
                                editable={!registerMutation.isPending}
                            />
                            {name.length > 0 && !nameError && (
                                <View className="ml-2"><CheckCircle2 size={20} color="#22c55e" /></View>
                            )}
                        </View>
                        {nameError ? (
                            <View className="flex-row items-center mt-2 ml-1">
                                <View className="mr-1"><AlertCircle size={14} color="#ef4444" /></View>
                                <Text className="text-red-500 font-[Manrope-Medium] text-xs">{nameError}</Text>
                            </View>
                        ) : null}
                    </View>

                    <View className="w-full mb-6">
                        <Text className="text-gray-400 font-[Manrope-Bold] text-xs uppercase tracking-wider mb-2 ml-1">Email Address</Text>
                        <View className={`flex-row items-center bg-[#111827]/60 border rounded-2xl px-4 h-[60px] ${getEmailBorder()}`}>
                            <View className="mr-3"><Mail size={20} color="#9CA3AF" /></View>
                            <TextInput
                                placeholder="you@eduquiz.lan"
                                placeholderTextColor="#4B5563"
                                className="flex-1 text-white font-[Manrope-Medium] text-base"
                                onChangeText={handleEmailChange}
                                value={email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!registerMutation.isPending}
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

                    <View className="w-full mb-10">
                        <Text className="text-gray-400 font-[Manrope-Bold] text-xs uppercase tracking-wider mb-2 ml-1">Secure Password</Text>
                        <View className={`flex-row items-center bg-[#111827]/60 border rounded-2xl px-4 h-[60px] ${getPasswordBorder()}`}>
                            <View className="mr-3"><Lock size={20} color="#9CA3AF" /></View>
                            <TextInput
                                placeholder="••••••••••••"
                                placeholderTextColor="#4B5563"
                                className="flex-1 text-white font-[Manrope-Medium] text-base tracking-widest"
                                onChangeText={handlePasswordChange}
                                value={password}
                                secureTextEntry={!isPasswordVisible}
                                editable={!registerMutation.isPending}
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
                        ) : password.length === 0 ? (
                            <Text className="text-gray-500 font-[Manrope-Medium] text-xs mt-2 ml-2">Minimum 6 characters</Text>
                        ) : null}
                    </View>

                    {/* 🚀 CREATE ACCOUNT BUTTON */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onSubmit}
                        disabled={!isFormValid || registerMutation.isPending}
                        // 🟢 FIX: Shadow hata di className se
                        className={`w-full h-[60px] rounded-2xl flex-row items-center justify-center mb-8
                            ${(!isFormValid || registerMutation.isPending) ? 'bg-gray-700 opacity-50' : 'bg-[#8B5CF6]'}`}
                        // 🟢 FIX: Safe Native Style use kiya shadow ke liye
                        style={isFormValid && !registerMutation.isPending ? {
                            shadowColor: '#8B5CF6',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.6,
                            shadowRadius: 15,
                            elevation: 8 // Android par glow ke liye
                        } : {}}
                    >
                        {registerMutation.isPending ? <ActivityIndicator color="white" /> : (
                            <>
                                <Text className="text-white font-[Manrope-Bold] text-sm tracking-[1.5px] mr-2">CREATE ACCOUNT</Text>
                                <View><ArrowRight size={20} color="white" /></View>
                            </>
                        )}
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-4 pb-6">
                        <Text className="text-gray-400 font-[Manrope-Medium] text-sm">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/login')} disabled={registerMutation.isPending}>
                            <Text className="text-[#A855F7] font-[Manrope-Bold] text-sm">Sign In</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </SafeAreaView>
    );
}