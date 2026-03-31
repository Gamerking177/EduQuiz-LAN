import React, { useState, useCallback, startTransition } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, FileText, ArrowRight, PlusCircle, Image as ImageIcon, X, Download } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

// 🟢 NAYA: React Query Import kiya
import { useMutation } from '@tanstack/react-query';

import QuizInput from '../components/QuizInput';
import QuestionCard from '../components/QuestionCard';
import GameSettings from '../components/GameSettings';
import CategorySelector from '../components/CategorySelector';

import { createGame } from '../utils/api';
import socketService from '../utils/socket';
import useGameStore from '../store/useGameStore';
import CustomAlert from '../components/CustomAlert';

const getNewQuestion = () => ({
    id: Date.now().toString() + Math.random().toString(), 
    text: '', options: ['', '', '', ''], correctAnswer: 0, format: 'MCQ', difficulty: 'Easy'
});

export default function CreateQuiz() {
    const router = useRouter();

    const setRoomCode = useGameStore((state) => state.setRoomCode);
    const setQuizData = useGameStore((state) => state.setQuizData);
    const setIsHost = useGameStore((state) => state.setIsHost);

    // 🟢 isLoading hata diya kyunki React Query automatically isPending deta hai
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Programming',
        quizImage: null,
        questionCount: 1,
        maxPlayers: 50,
        timePerQuestion: '30s',
        allowLateJoin: false,
        restrictToWifi: true,
        questionOrder: 'Sequential',
    });

    const [questions, setQuestions] = useState([getNewQuestion()]);

    const showAlert = (title, message, type = 'error') => {
        setAlertConfig({ visible: true, title, message, type });
    };

    const handleCategorySelect = useCallback((selectedCat) => {
        setFormData((prev) => ({ ...prev, category: selectedCat }));
    }, []);

    const pickQuizImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        if (!result.canceled) {
            setFormData({ ...formData, quizImage: result.assets[0].uri });
        }
    };

    const handleImportQuiz = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/json', 'text/plain'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const fileUri = result.assets[0].uri;
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            const parsedData = JSON.parse(fileContent);

            if (parsedData.questions && Array.isArray(parsedData.questions)) {
                const questionsWithIds = parsedData.questions.map(q => ({
                    ...q, 
                    id: q.id || (Date.now().toString() + Math.random().toString())
                }));
                
                setQuestions(questionsWithIds);

                setFormData(prev => ({
                    ...prev,
                    title: parsedData.settings?.title || parsedData.title || prev.title,
                    description: parsedData.settings?.description || parsedData.description || prev.description,
                    category: parsedData.settings?.category || parsedData.category || prev.category,
                    timePerQuestion: parsedData.settings?.timePerQuestion || prev.timePerQuestion,
                    allowLateJoin: parsedData.settings?.allowLateJoin !== undefined ? parsedData.settings.allowLateJoin : prev.allowLateJoin,
                    restrictToWifi: parsedData.settings?.restrictToWifi !== undefined ? parsedData.settings.restrictToWifi : prev.restrictToWifi,
                    questionOrder: parsedData.settings?.questionOrder || prev.questionOrder,
                    maxPlayers: parsedData.settings?.maxPlayers || prev.maxPlayers,
                    questionCount: questionsWithIds.length
                }));

                showAlert("Success", "All Settings and Questions imported perfectly! 🔥", "success");
            } else {
                showAlert("Invalid Format", "Invalid JSON format. The 'questions' array is missing.", "error");
            }
        } catch (error) {
            console.error("Import Error:", error);
            showAlert("Error", "File read nahi ho payi. Format check karein.", "error");
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, getNewQuestion()]);
        setFormData(prev => ({ ...prev, questionCount: prev.questionCount + 1 }));
    };

    const updateQuestion = (index, newData) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], ...newData };
        setQuestions(updated);
    };

    const removeQuestion = (index) => {
        if (questions.length > 1) {
            const filtered = questions.filter((_, i) => i !== index);
            setQuestions(filtered);
            setFormData(prev => ({ ...prev, questionCount: prev.questionCount - 1 }));
        }
    };

    // ==========================================
    // 🟢 NAYA: React Query ka useMutation
    // ==========================================
    const createGameMutation = useMutation({
        mutationFn: createGame,
        onSuccess: (response) => {
            if (response.success) {
                const { roomCode } = response.data;
                setRoomCode(roomCode);
                setIsHost(true);

                setQuizData({
                    title: formData.title,
                    totalQuestions: questions.length,
                    category: formData.category
                });

                socketService.connect();
                socketService.emit("create-room", { roomCode, hostName: "Admin" });

                router.push('/waiting-area');
            }
        },
        onError: (error) => {
            showAlert("API Error", error.response?.data?.message || "Check console for field mismatch!", "error");
        }
    });

    const handleCreateLobby = () => {
        if (!formData.title || questions.length === 0) {
            showAlert("Details Missing", "Please enter a quiz title and add at least one question!", "error");
            return;
        }

        const formattedQuestions = questions.map((q) => ({
            questionText: q.text,
            type: q.format === "True/False" ? "TRUE_FALSE" : "MCQ",
            options: q.format === "True/False" ? ["True", "False"] : q.options,
            correctAnswer: String(q.options[q.correctAnswer]),
            difficulty: q.difficulty.toLowerCase(),
            timeLimit: parseInt(formData.timePerQuestion) || 15
        }));

        const apiPayload = {
            questions: formattedQuestions,
            settings: {
                title: formData.title,
                category: formData.category,
                timePerQuestion: parseInt(formData.timePerQuestion) || 15,
                allowLateJoin: formData.allowLateJoin,
                questionOrder: formData.questionOrder === 'Random' ? 'random' : 'sequence',
                restrictToWifi: formData.restrictToWifi,
                maxPlayers: formData.maxPlayers
            }
        };

        // 🟢 Seedha mutate call karo, try-catch ki tension nahi!
        createGameMutation.mutate(apiPayload);
    };

    const renderHeader = () => (
        <View className="px-6 mt-4">
            <TouchableOpacity onPress={handleImportQuiz} className="flex-row items-center justify-center bg-indigo-500/20 border-dashed border-2 border-indigo-500/40 p-4 rounded-2xl mb-6">
                <Download size={20} color="#818CF8" />
                <Text className="text-indigo-300 font-[Manrope-Bold] text-base ml-2">Import Dummy JSON</Text>
            </TouchableOpacity>

            <View className="bg-[#111827]/30 border border-gray-800 p-5 rounded-[32px] mb-6">
                <View className="flex-row items-center mb-4">
                    <FileText size={18} color="#6366f1" />
                    <Text className="text-white font-[Manrope-Bold] ml-2">Quiz Details</Text>
                </View>

                <TouchableOpacity onPress={pickQuizImage} className="border-2 border-dashed border-gray-800 h-44 rounded-3xl items-center justify-center mb-6 bg-[#050B18] overflow-hidden">
                    {formData.quizImage ? (
                        <View className="w-full h-full relative">
                            <Image source={{ uri: formData.quizImage }} className="w-full h-full" resizeMode="cover" />
                            <TouchableOpacity onPress={() => setFormData({ ...formData, quizImage: null })} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full">
                                <X size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View className="bg-indigo-500/10 p-4 rounded-full">
                                <ImageIcon size={32} color="#6366f1" />
                            </View>
                            <Text className="text-gray-400 font-[Manrope-Medium] mt-3 text-sm">Add Quiz Banner</Text>
                        </>
                    )}
                </TouchableOpacity>

                <QuizInput 
                    label="Quiz Title" 
                    placeholder="Enter Quiz Title" 
                    value={formData.title} 
                    onChangeText={(val) => startTransition(() => setFormData({ ...formData, title: val }))} 
                />
                <QuizInput 
                    label="Description (Optional)" 
                    placeholder="What is this quiz about?" 
                    multiline 
                    value={formData.description} 
                    onChangeText={(val) => startTransition(() => setFormData({ ...formData, description: val }))} 
                />

                <CategorySelector
                    selectedCategory={formData.category}
                    onSelectCategory={handleCategorySelect}
                />
            </View>

            <Text className="text-white font-[Manrope-Bold] text-xl mb-6">Quiz Questions</Text>
        </View>
    );

    const renderFooter = () => (
        <View className="px-6 mb-10">
            <TouchableOpacity onPress={addQuestion} className="border-2 border-dashed border-indigo-500/30 p-6 rounded-[32px] items-center justify-center mb-10 mt-4">
                <View className="flex-row items-center">
                    <PlusCircle size={20} color="#6366f1" />
                    <Text className="text-indigo-500 font-[Manrope-Bold] ml-2 text-lg">Add Another Question</Text>
                </View>
            </TouchableOpacity>

            <GameSettings
                formData={formData}
                setFormData={setFormData}
                addQuestion={addQuestion}
                removeQuestion={removeQuestion}
                questionsCount={questions.length}
            />

            {/* 🟢 BUTTON FIX: isLoading ki jagah createGameMutation.isPending */}
            <TouchableOpacity 
                onPress={handleCreateLobby} 
                disabled={createGameMutation.isPending} 
                className={`h-16 rounded-3xl flex-row items-center justify-center shadow-xl shadow-indigo-900/40 ${createGameMutation.isPending ? 'bg-indigo-400' : 'bg-indigo-600'}`}
            >
                {createGameMutation.isPending ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        <Text className="text-white font-[Manrope-Bold] text-lg mr-2">Create Game Lobby</Text>
                        <ArrowRight size={20} color="white" />
                    </>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#050B18]">
            <View className="flex-row items-center px-6 py-4 border-b border-gray-900">
                <TouchableOpacity onPress={() => router.back()}><ChevronLeft color="white" /></TouchableOpacity>
                <Text className="flex-1 text-center text-white font-[Manrope-Bold] text-lg">Create Quiz</Text>
            </View>

            <FlatList
                data={questions}
                keyExtractor={(item, index) => item.id || index.toString()}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
                
                removeClippedSubviews={true} 
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={5}

                renderItem={({ item, index }) => (
                    <View className="px-6">
                        <QuestionCard
                            index={index}
                            questionData={item}
                            updateQuestion={(data) => updateQuestion(index, data)}
                            removeQuestion={() => removeQuestion(index)}
                        />
                    </View>
                )}
            />

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