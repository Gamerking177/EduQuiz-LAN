import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Download, Home, FileSpreadsheet, Trophy, Medal } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import useGameStore from '../store/useGameStore';
import CustomDialog from '../components/CustomDialog'; // 🟢 Naya Dialog Import

export default function HostFinalResultsScreen() {
    const { players, quizData, clearStore } = useGameStore();

    // 🟢 Custom Dialog State
    const [dialogConfig, setDialogConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });

    const quizTitle = quizData?.title || quizData?.settings?.title || "Quiz Session";
    const totalQuestions = quizData?.totalQuestions || quizData?.questions?.length || 0;

    const showDialog = (title, message, type) => {
        setDialogConfig({ visible: true, title, message, type });
    };

    const handleExportCSV = async () => {
        if (players.length === 0) {
            showDialog("No Data Found", "There are no players in this session to export.", "warning");
            return;
        }

        try {
            let csvString = "Rank,Player Name,Correct Answers,Wrong/Skipped,Total Score\n";
            players.forEach((p, index) => {
                const correctCount = p.correct || 0;
                const wrongCount = totalQuestions - correctCount;
                const score = correctCount * 10; 
                csvString += `${index + 1},${p.name},${correctCount},${wrongCount},${score}\n`;
            });

            const fileName = `Quiz_Results_${Date.now()}.csv`;
            const fileUri = FileSystem.documentDirectory + fileName;

            await FileSystem.writeAsStringAsync(fileUri, csvString, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/csv',
                    dialogTitle: 'Export Quiz Results',
                    UTI: 'public.comma-separated-values-text'
                });
                // Optional: Success dialog dikhana ho toh (Share sheet ke baad)
                // showDialog("Success", "File exported successfully!", "success");
            } else {
                showDialog("Export Failed", "Sharing is not available on this device.", "error");
            }

        } catch (error) {
            console.error("Export Error:", error);
            showDialog("Something Went Wrong", "Could not generate the export file.", "error");
        }
    };

    const handleGoHome = () => {
        clearStore();
        router.replace('/home');
    };

    return (
        <SafeAreaView className="flex-1 bg-[#020617]">
            {/* 🟢 Render Custom Dialog */}
            <CustomDialog 
                visible={dialogConfig.visible}
                title={dialogConfig.title}
                message={dialogConfig.message}
                type={dialogConfig.type}
                onClose={() => setDialogConfig({ ...dialogConfig, visible: false })}
            />

            {/* Header */}
            <View className="px-6 py-6 border-b border-gray-800 flex-row justify-between items-center">
                <View>
                    <Text className="text-gray-400 font-[Manrope-Bold] text-xs uppercase tracking-widest mb-1">
                        Session Complete
                    </Text>
                    <Text className="text-white font-[Manrope-Bold] text-2xl" numberOfLines={1}>
                        Final Report
                    </Text>
                </View>
                <View className="bg-green-500/20 p-3 rounded-full border border-green-500/30">
                    <Trophy color="#22C55E" size={24} />
                </View>
            </View>

            {/* Table Header */}
            <View className="px-6 py-3 flex-row border-b border-gray-800 bg-[#0F172A]">
                <Text className="text-gray-400 font-[Manrope-Bold] text-xs w-12 text-center">Rank</Text>
                <Text className="text-gray-400 font-[Manrope-Bold] text-xs flex-1 ml-2">Player Name</Text>
                <Text className="text-gray-400 font-[Manrope-Bold] text-xs w-16 text-center">Correct</Text>
                <Text className="text-gray-400 font-[Manrope-Bold] text-xs w-16 text-right">Score</Text>
            </View>

            {/* Players List */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {players.length === 0 ? (
                    <Text className="text-gray-500 text-center font-[Manrope-Medium] mt-10">
                        No player data available.
                    </Text>
                ) : (
                    players.map((player, index) => {
                        const rankColor = index === 0 ? "#FACC15" : index === 1 ? "#94A3B8" : index === 2 ? "#D97706" : "#4B5563";
                        const score = (player.correct || 0) * 10;

                        return (
                            <View key={player.id || index} className="px-6 py-4 flex-row items-center border-b border-gray-800/50 bg-[#020617]">
                                <View className="w-12 items-center justify-center">
                                    {index < 3 ? <Medal color={rankColor} size={20} /> : <Text className="text-gray-500 font-[Manrope-Bold] text-sm">#{index + 1}</Text>}
                                </View>
                                <Text className="text-white font-[Manrope-Bold] text-base flex-1 ml-2" numberOfLines={1}>
                                    {player.name}
                                </Text>
                                <View className="w-16 items-center">
                                    <Text className="text-[#34D399] font-[Manrope-Bold] text-sm">{player.correct || 0}/{totalQuestions}</Text>
                                </View>
                                <View className="w-16 items-end">
                                    <Text className="text-indigo-400 font-[Manrope-Bold] text-base">{score}</Text>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Bottom Buttons */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-[#020617]/95 border-t border-gray-900 flex-row justify-between">
                <TouchableOpacity 
                    onPress={handleExportCSV}
                    className="flex-1 bg-[#22C55E] flex-row items-center justify-center py-4 rounded-2xl mr-3 shadow-lg shadow-green-900/40"
                >
                    <FileSpreadsheet color="white" size={20} className="mr-2" />
                    <Text className="text-white font-[Manrope-Bold] text-lg">Export CSV</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={handleGoHome}
                    className="flex-row items-center justify-center py-4 px-6 rounded-2xl border-2 border-gray-700 bg-gray-800"
                >
                    <Home color="white" size={20} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}