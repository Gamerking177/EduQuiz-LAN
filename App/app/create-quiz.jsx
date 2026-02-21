import React, { useState } from 'react';
import { ScrollView, View, Text, Switch, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, FileText, Settings, ArrowRight, PlusCircle, Image as ImageIcon, X, Wifi, WifiOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import CounterInput from '../components/CounterInput';
import QuizInput from '../components/QuizInput';
import QuestionCard from '../components/QuestionCard';
import GameSettings from '../components/GameSettings';

export default function CreateQuiz() {
    const router = useRouter();

    // --- Form State Management ---
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        quizImage: null,
        questionCount: 1,
        maxPlayers: 50,
        timePerQuestion: '30s',
        allowLateJoin: false,
        restrictToWifi: true,
        questionOrder: 'Sequential', // 🟢 Yeh line zaroori hai
    });

    // --- Questions State ---
    const [questions, setQuestions] = useState([
        { text: '', options: ['', '', '', ''], correctAnswer: 0, format: 'MCQ', difficulty: 'Medium' }
    ]);

    // Single Image Picker Logic
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

    return (
        <SafeAreaView className="flex-1 bg-[#050B18]">
            {/* Header */}
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

                    {/* Dotted Border Image Picker */}
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
                </View>

                {/* Dynamic Questions List */}
                <View>
                    <Text className="text-white font-[Manrope-Bold] text-xl mb-6">Quiz Questions</Text>
                    {/* Questions Loop in create-quiz.jsx */}
                    {questions.map((q, idx) => (
                        <QuestionCard
                            key={`quiz-q-${idx}`} // 🟢 Unique string key
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

                {/* game settings component */}
                <GameSettings
                    formData={formData}
                    setFormData={setFormData}
                    addQuestion={addQuestion}
                    removeQuestion={removeQuestion}
                    questionsCount={questions.length}
                />

                {/* Launch Button */}
                <TouchableOpacity className="bg-indigo-600 h-16 rounded-3xl flex-row items-center justify-center mb-10 shadow-xl shadow-indigo-900/40">
                    <Text className="text-white font-[Manrope-Bold] text-lg mr-2">Create Game Lobby</Text>
                    <ArrowRight size={20} color="white" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}