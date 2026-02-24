import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, FileText, ArrowRight, PlusCircle, Image as ImageIcon, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import QuizInput from '../components/QuizInput';
import QuestionCard from '../components/QuestionCard';
import GameSettings from '../components/GameSettings';
import CategorySelector from '../components/CategorySelector'; // 🟢 1. Naya Import

// 🟢 Naye Imports Backend & Store ke liye
import { createGame } from '../utils/api';
import socketService from '../utils/socket';
import useGameStore from '../store/useGameStore';
import CustomAlert from '../components/CustomAlert';

export default function CreateQuiz() {
    const router = useRouter();

    // 🟢 Zustand Actions
    const setRoomCode = useGameStore((state) => state.setRoomCode);
    const setQuizData = useGameStore((state) => state.setQuizData);
    const setIsHost = useGameStore((state) => state.setIsHost);

    // --- Loading State for API Call ---
    const [isLoading, setIsLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '' });

    // --- Form State Management ---
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Programming', // 🟢 2. Default category add ki
        quizImage: null,
        questionCount: 1,
        maxPlayers: 50,
        timePerQuestion: '30s',
        allowLateJoin: false,
        restrictToWifi: true,
        questionOrder: 'Sequential',
    });

    // --- Questions State ---
    const [questions, setQuestions] = useState([
        { text: '', options: ['', '', '', ''], correctAnswer: 0, format: 'MCQ', difficulty: 'Easy' }
    ]);

    const showAlert = (title, message) => {
        setAlertConfig({ visible: true, title, message });
    };

    // 🟢 3. useCallback hook taaki CategorySelector faltu re-render na ho
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

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: 0, format: 'MCQ', difficulty: 'Medium' }]);
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

    // 🟢 API & Socket Logic
    const handleCreateLobby = async () => {
        if (!formData.title || questions.length === 0) {
            showAlert("Details Missing", "Bhai, Quiz ka title aur kam se kam ek question toh daal!");
            return;
        }

        try {
            setIsLoading(true);

            // 🟢 1. Questions Mapping (As per your question schema)
            const formattedQuestions = questions.map((q) => ({
                questionText: q.text,
                type: q.format === "True/False" ? "TRUE_FALSE" : "MCQ",
                options: q.format === "True/False" ? ["True", "False"] : q.options,
                correctAnswer: String(q.options[q.correctAnswer]), // String value backend requirement
                difficulty: q.difficulty.toLowerCase(), // 'easy', 'medium', 'hard'
                timeLimit: parseInt(formData.timePerQuestion) || 15 // mapped to timeLimit
            }));

            // 🟢 2. Final API Payload (Matching gameSchema settings object)
            const apiPayload = {
                questions: formattedQuestions, // Questions array at root
                settings: {
                    title: formData.title,
                    category: formData.category,
                    timePerQuestion: parseInt(formData.timePerQuestion) || 15,
                    allowLateJoin: formData.allowLateJoin,
                    // Sequential -> sequence, Random -> random (enum fix)
                    questionOrder: formData.questionOrder === 'Random' ? 'random' : 'sequence',
                    restrictToWifi: formData.restrictToWifi,
                    maxPlayers: formData.maxPlayers
                }
            };

            console.log("📤 Sending Schema-Perfect Payload:", JSON.stringify(apiPayload, null, 2));

            const response = await createGame(apiPayload);

            if (response.success) {
                const { roomCode } = response.data;
                setRoomCode(roomCode);
                setIsHost(true);

                // Socket logic
                socketService.connect();
                socketService.emit("create-room", { roomCode, hostName: "Admin" });

                router.push('/waiting-area');
            }
        } catch (error) {
            showAlert("API Error", error.response?.data?.message || "Check console for field mismatch!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#050B18]">
            <View className="flex-row items-center px-6 py-4 border-b border-gray-900">
                <TouchableOpacity onPress={() => router.back()}><ChevronLeft color="white" /></TouchableOpacity>
                <Text className="flex-1 text-center text-white font-[Manrope-Bold] text-lg">Create Quiz</Text>
            </View>

            <ScrollView className="px-6 mt-4" showsVerticalScrollIndicator={false}>

                {/* Section: Quiz Details with Banner Picker */}
                <View className="bg-[#111827]/30 border border-gray-800 p-5 rounded-[32px] mb-6">
                    <View className="flex-row items-center mb-4">
                        <FileText size={18} color="#6366f1" />
                        <Text className="text-white font-[Manrope-Bold] ml-2">Quiz Details</Text>
                    </View>

                    <TouchableOpacity
                        onPress={pickQuizImage}
                        className="border-2 border-dashed border-gray-800 h-44 rounded-3xl items-center justify-center mb-6 bg-[#050B18] overflow-hidden"
                    >
                        {formData.quizImage ? (
                            <View className="w-full h-full relative">
                                <Image source={{ uri: formData.quizImage }} className="w-full h-full" resizeMode="cover" />
                                <TouchableOpacity
                                    onPress={() => setFormData({ ...formData, quizImage: null })}
                                    className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"
                                >
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

                    <QuizInput label="Quiz Title" placeholder="Enter Quiz Title" value={formData.title} onChangeText={(val) => setFormData({ ...formData, title: val })} />
                    <QuizInput label="Description (Optional)" placeholder="What is this quiz about?" multiline value={formData.description} onChangeText={(val) => setFormData({ ...formData, description: val })} />

                    {/* 🟢 5. Category Selector UI yahan inject kiya */}
                    <CategorySelector
                        selectedCategory={formData.category}
                        onSelectCategory={handleCategorySelect}
                    />
                </View>

                {/* Dynamic Questions List */}
                <View>
                    <Text className="text-white font-[Manrope-Bold] text-xl mb-6">Quiz Questions</Text>
                    {questions.map((q, idx) => (
                        <QuestionCard
                            key={`quiz-q-${idx}`}
                            index={idx}
                            questionData={q}
                            updateQuestion={(data) => updateQuestion(idx, data)}
                            removeQuestion={() => removeQuestion(idx)}
                        />
                    ))}
                </View>

                {/* Add Another Question Button */}
                <TouchableOpacity
                    onPress={addQuestion}
                    className="border-2 border-dashed border-indigo-500/30 p-6 rounded-[32px] items-center justify-center mb-10"
                >
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

                <TouchableOpacity
                    onPress={handleCreateLobby}
                    disabled={isLoading}
                    className={`h-16 rounded-3xl flex-row items-center justify-center mb-10 shadow-xl shadow-indigo-900/40 ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-white font-[Manrope-Bold] text-lg mr-2">Create Game Lobby</Text>
                            <ArrowRight size={20} color="white" />
                        </>
                    )}
                </TouchableOpacity>

            </ScrollView>
            {/* 🟢 Alert Modal */}
            <CustomAlert 
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </SafeAreaView>
    );
}