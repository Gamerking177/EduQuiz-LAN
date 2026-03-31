import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// 🟢 CheckCircle2 import kiya Kahoot UX ke liye
import { ChevronLeft, Gamepad2, User, Key, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Network from 'expo-network';

// 🟢 NAYA: React Query aur getGameInfo API import ki
import { useMutation, useQuery } from '@tanstack/react-query';
import { joinGame, getGameInfo } from '../utils/api'; 
import socketService from '../utils/socket';
import useGameStore from '../store/useGameStore';
import CustomAlert from '../components/CustomAlert';

export default function JoinGame() {
    const router = useRouter();
    const [roomCode, setRoomCode] = useState('');
    const [nickname, setNickname] = useState('');
    const [ipAddress, setIpAddress] = useState('0.0.0.0');
    const [isConnected, setIsConnected] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });

    // 🟢 Zustand Actions
    const setRoomCodeStore = useGameStore((state) => state.setRoomCode);
    const setPlayerNameStore = useGameStore((state) => state.setPlayerName);
    const setIsHostStore = useGameStore((state) => state.setIsHost);

    useEffect(() => {
        (async () => {
            try {
                const ip = await Network.getIpAddressAsync();
                const networkState = await Network.getNetworkStateAsync();

                setIpAddress(ip);
                setIsConnected(networkState.isConnected && networkState.type === Network.NetworkStateType.WIFI);
            } catch (error) {
                console.error("IP fetch fail:", error);
                setIpAddress('Not Connected');
            }
        })();
    }, []);

    const showAlert = (title, message) => {
        setAlertConfig({ visible: true, title, message });
    };

    // ==========================================
    // 🟢 1. KAHOOT MAGIC: Auto-Check Room (useQuery)
    // ==========================================
    const { data: roomInfo, isFetching: isCheckingRoom, isError: isRoomError, isSuccess: isRoomFound } = useQuery({
        queryKey: ['checkRoom', roomCode],
        queryFn: () => getGameInfo(roomCode),
        enabled: roomCode.length === 6, // 🟢 JADUU: API sirf tab hit hogi jab 6 letters pure honge!
        retry: false, // Galat code pe baar-baar retry nahi marna
    });

    // ==========================================
    // 🟢 2. JOIN GAME LOGIC (useMutation)
    // ==========================================
    const joinMutation = useMutation({
        mutationFn: joinGame,
        onSuccess: (response) => {
            if (response.success) {
                setRoomCodeStore(roomCode);
                setPlayerNameStore(nickname);
                setIsHostStore(false); // Ye player hai

                socketService.connect();
                socketService.joinRoom(roomCode, nickname, ipAddress);

                // 🟢 THE PRO FIX (No Fooling this time): 'active' check!
                const gameStatus = response.data?.status || response.data?.gameStatus;

                if (gameStatus === 'active') {
                    console.log("🚀 Late Joiner detected! Sending directly to battlefield.");
                    router.push('/question-panel'); 
                } else {
                    console.log("⏳ Game not started yet. Sending to waiting area.");
                    router.push('/waiting-area');
                }

            } else {
                showAlert("Join Failed", response.message || "Room code galat hai ya game start ho chuka hai.");
            }
        },
        onError: (error) => {
            showAlert("Server Error", error.response?.data?.message || "Server issue! Render ko wake up hone do.");
        }
    });

    const handleJoin = () => {
        if (!roomCode || !nickname) {
            showAlert("Details Missing", "Bhai, Room Code aur Nickname dono zaruri hain!");
            return;
        }

        // 🟢 Seedha Mutate call karo
        joinMutation.mutate({
            roomCode: roomCode,
            playerName: nickname,
            deviceId: ipAddress 
        });
    };


    return (
        <SafeAreaView className="flex-1 bg-[#050B18]">
            {/* Header */}
            <View className="flex-row items-center px-6 py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft color="white" size={28} />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-white font-[Manrope-Bold] text-lg mr-7">EduQuiz LAN</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center px-6">
                <View className="bg-[#111827]/50 border border-gray-800 p-8 rounded-[40px] items-center">
                    <View className="bg-indigo-500/10 p-4 rounded-3xl mb-6">
                        <Gamepad2 size={32} color="#6366f1" />
                    </View>

                    <Text className="text-white font-[Manrope-Bold] text-2xl mb-2">Join Game</Text>
                    <Text className="text-gray-500 font-[Manrope-Medium] text-center mb-8 text-sm">Enter the code provided by your host</Text>

                    {/* Room Code Input */}
                    <View className="w-full mb-6">
                        <Text className="text-gray-400 font-[Manrope-Bold] text-[10px] uppercase tracking-widest mb-2 ml-1">Room Code</Text>
                        <View className={`flex-row items-center bg-[#050B18] border rounded-2xl px-4 h-16 ${roomCode.length === 6 && isRoomFound ? 'border-green-500/50' : 'border-gray-800'}`}>
                            <TextInput
                                placeholder="A 1 B 2 C 3"
                                placeholderTextColor="#374151"
                                className="flex-1 text-white font-[Manrope-Bold] text-xl tracking-[4px] text-center"
                                value={roomCode}
                                onChangeText={(text) => setRoomCode(text.toUpperCase())}
                                autoCapitalize="characters"
                                autoCorrect={false}
                                maxLength={6}
                                editable={!joinMutation.isPending}
                            />
                            {isCheckingRoom ? (
                                <ActivityIndicator size="small" color="#6366f1" />
                            ) : (
                                <Key size={20} color="#4B5563" />
                            )}
                        </View>
                        
                        {/* 🟢 KAHOOT UX: Feedback below input */}
                        {roomCode.length === 6 && (
                            <View className="mt-2 ml-1 flex-row items-center justify-center">
                                {isRoomFound && roomInfo?.success && (
                                    <>
                                        <CheckCircle2 size={14} color="#22c55e" className="mr-1" />
                                        <Text className="text-green-500 font-[Manrope-SemiBold] text-xs">
                                            Room Found: {roomInfo.data?.settings?.title || roomInfo.data?.title || 'Ready to join!'}
                                        </Text>
                                    </>
                                )}
                                {isRoomError && (
                                    <Text className="text-red-500 font-[Manrope-SemiBold] text-xs">
                                        Room not found. Check code.
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Nickname Input */}
                    <View className="w-full mb-10">
                        <Text className="text-gray-400 font-[Manrope-Bold] text-[10px] uppercase tracking-widest mb-2 ml-1">Nickname</Text>
                        <View className="flex-row items-center bg-[#050B18] border border-gray-800 rounded-2xl px-4 h-16">
                            <User size={20} color="#4B5563" className="mr-3" />
                            <TextInput
                                placeholder="Student Name"
                                placeholderTextColor="#374151"
                                className="flex-1 text-white font-[Manrope-SemiBold] text-lg"
                                value={nickname}
                                onChangeText={setNickname}
                                editable={!joinMutation.isPending}
                            />
                        </View>
                    </View>

                    {/* 🟢 Join Button with React Query Pending State */}
                    <TouchableOpacity
                        onPress={handleJoin}
                        disabled={joinMutation.isPending || isCheckingRoom}
                        className={`w-full h-16 rounded-2xl flex-row items-center justify-center ${(joinMutation.isPending || isCheckingRoom) ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                    >
                        {joinMutation.isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text className="text-white font-[Manrope-Bold] text-lg mr-2">Join Room</Text>
                                <ArrowRight size={20} color="white" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Network Indicator (unchanged) */}
                <View className="items-center mt-10">
                    <View className={`flex-row items-center px-4 py-2 rounded-full border ${isConnected ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                        <View className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className={`font-[Manrope-Bold] text-[10px] uppercase ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                            {isConnected ? 'Local Network Active' : 'No WiFi Detected'}
                        </Text>
                    </View>
                    <Text className="text-gray-600 font-[Manrope-Medium] text-[10px] mt-2 tracking-widest">
                        IP: {ipAddress}
                    </Text>
                </View>
            </KeyboardAvoidingView>
            
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertConfig({ visible: false, title: '', message: '' })}
            />
        </SafeAreaView>
    );
}