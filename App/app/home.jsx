import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Users, ChevronRight, History } from 'lucide-react-native';
import ActionCard from '../components/ActionCard'; 
import * as Network from 'expo-network'; 
import { useRouter } from 'expo-router';

// 🟢 1. Store Import Karo
import useGameStore from '../store/useGameStore'; 

export default function HomeDashboard() {
  const [isWifiConnected, setIsWifiConnected] = useState(false);
  const router = useRouter();

  const roomCode = useGameStore((state) => state.roomCode);
  const isHost = useGameStore((state) => state.isHost);
  const clearStore = useGameStore((state) => state.clearStore);

  useEffect(() => {
    if (roomCode && !isHost) {
        clearStore();
    }
  }, [roomCode, isHost]);

  useEffect(() => {
    const checkNetwork = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsWifiConnected(state.type === Network.NetworkStateType.WIFI && state.isConnected);
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#050B18] px-6">
      <ScrollView showsVerticalScrollIndicator={false} className="mt-8">
        
        {/* Header */}
        <View className="items-center mb-10">
          <Text className="text-white text-4xl font-[Manrope-Bold]">EduQuiz LAN</Text>
          <Text className="text-gray-400 text-center font-[Manrope-Medium] mt-2 px-10">
            Host or join live quizzes instantly over your local network.
          </Text>
        </View>

        {/* 🟢 FIX: Banner sirf tab dikhega jab roomCode HOGA aur banda HOST HOGA */}
        {roomCode && isHost ? (
          <View className="bg-indigo-600 p-5 mb-8 rounded-3xl flex-row items-center justify-between border border-indigo-400/50 shadow-lg shadow-indigo-900/50">
            <View>
              <Text className="text-white font-[Manrope-Bold] text-lg">Active Game Found!</Text>
              <Text className="text-indigo-200 font-[Manrope-Medium] text-sm">
                Room: {roomCode} • Host
              </Text>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => clearStore()} className="bg-red-500/20 px-3 py-2 rounded-xl mr-2 border border-red-500/30">
                <Text className="text-red-400 font-[Manrope-Bold] text-xs">Drop</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => router.push('/waiting-area')} className="bg-white px-4 py-2 rounded-xl">
                <Text className="text-indigo-600 font-[Manrope-Bold] text-xs">Resume</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Action Cards */}
        <ActionCard 
          title="Create Game"
          desc="Start hosting a new quiz session as the server."
          icon={Plus}
          colorClass="bg-indigo-600"
          delay={200}
          onPress={() => router.push("/create-quiz")}
        />
        
        <ActionCard 
          title="Join Game"
          desc="Enter a code or scan to participate in a live quiz."
          icon={Users}
          colorClass="bg-teal-600"
          delay={400}
          onPress={() => router.push("/join-game")}
        />

        {/* Recent Activity Header */}
        <View className="flex-row justify-between items-center mt-6 mb-4">
          <Text className="text-gray-400 font-[Manrope-Bold] uppercase tracking-widest text-xs">Recent Activity</Text>
          <TouchableOpacity><Text className="text-indigo-500 font-[Manrope-Bold] text-xs">View All</Text></TouchableOpacity>
        </View>

        {/* Activity Item */}
        <View className="bg-[#111827]/50 border border-gray-900 p-4 rounded-2xl flex-row items-center">
          <View className="bg-gray-800 p-3 rounded-xl mr-4">
            <History size={20} color="#9CA3AF" />
          </View>
          <View>
            <Text className="text-white font-[Manrope-SemiBold]">Science Trivia 101</Text>
            <Text className="text-gray-500 text-xs font-[Manrope-Regular]">Yesterday • Score: 8/10</Text>
          </View>
        </View>

        {/* LAN Status Badge */}
        <View className="items-center mt-12 mb-6">
          <View className={`flex-row items-center bg-[#111827] border ${isWifiConnected ? 'border-green-900/50' : 'border-red-900/50'} px-4 py-2 rounded-full`}>
            <View className={`w-2 h-2 ${isWifiConnected ? 'bg-green-500' : 'bg-red-500'} rounded-full mr-2`} />
            <Text className={`${isWifiConnected ? 'text-gray-300' : 'text-red-400'} font-[Manrope-Medium] text-xs`}>
              {isWifiConnected ? 'Connected to LAN' : 'No WiFi Connection'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}