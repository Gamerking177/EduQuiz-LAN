import React from 'react';
import { View, Text } from 'react-native';
import { Trophy } from 'lucide-react-native';

// 🟢 FIX: totalQuestions ko alag prop banaya
export default function PlayerCard({ player, totalQuestions }) {
    
    const getRankStyle = (rank) => {
        switch (rank) {
            case 1: return { border: 'border-[#EAB308]/80', bg: 'bg-[#422006]/40', icon: '#EAB308', subtitle: 'text-[#EAB308]' };
            case 2: return { border: 'border-[#A855F7]/80', bg: 'bg-[#3B0764]/40', icon: '#D1D5DB', subtitle: 'text-gray-400' };
            case 3: return { border: 'border-[#D97706]/80', bg: 'bg-[#451A03]/40', icon: '#D97706', subtitle: 'text-[#D97706]' };
            default: return { border: 'border-gray-800/50', bg: 'bg-[#0F172A]/40', icon: '#6B7280', subtitle: 'text-gray-500' };
        }
    };

    const style = getRankStyle(player.rank);
    const isTop3 = player.rank <= 3;
    // 🟢 Don't trust rank for 'finished' status
    const finishedStatus = player.isFinished; 

    return (
        <View className={`flex-row items-center justify-between p-4 mb-3 rounded-[20px] border ${style.border} ${style.bg}`}>
            <View className="flex-row items-center">
                <View className="w-10 h-10 items-center justify-center mr-3">
                    {player.rank === 1 ? (
                        <Trophy color={style.icon} size={26} />
                    ) : (
                        <View className="w-8 h-8 rounded-md border border-gray-600/50 items-center justify-center bg-gray-800/30">
                            <Text className={`font-[Manrope-Bold] text-lg ${isTop3 ? 'text-white' : 'text-gray-400'}`}>
                                {player.rank}
                            </Text>
                        </View>
                    )}
                </View>

                <View>
                    <Text className="font-[Manrope-Bold] text-lg text-white mb-0.5">
                        {player.name}
                    </Text>
                    <View className="flex-row items-center">
                        {isTop3 && (
                            <Text className={`font-[Manrope-Medium] text-xs ${style.subtitle} mr-1`}>
                                {player.rank === 1 ? '1st' : player.rank === 2 ? '2nd' : '3rd'} Place
                            </Text>
                        )}
                        {/* 🟢 FIX: Rank 1 condition hata di, sirf isFinished check hoga */}
                        {finishedStatus && (
                            <>
                                <Text className="text-gray-500 text-xs font-[Manrope-Bold] mr-1">•</Text>
                                <Text className="font-[Manrope-Medium] text-xs text-[#EAB308]">
                                    Finished
                                </Text>
                            </>
                        )}
                    </View>
                </View>
            </View>

            <View className="items-end">
                <Text className="text-white font-[Manrope-Bold] text-lg">
                    {player.correct || 0} Correct
                </Text>
                <View className="flex-row items-center mt-0.5">
                    {finishedStatus ? (
                        <>
                            <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5 shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                            <Text className="font-[Manrope-Medium] text-xs text-green-400">Done</Text>
                        </>
                    ) : (
                        <Text className="font-[Manrope-Medium] text-xs text-gray-400">
                            {/* 🟢 FIX: Fallback values for current and total questions */}
                            Q {player.currentQ || 1}/{totalQuestions || player.totalQs || '?'}
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
}