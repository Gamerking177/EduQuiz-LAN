import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, BackHandler, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react-native';

import socketService from '../utils/socket';
import useGameStore from '../store/useGameStore';

import QuestionHeader from '../components/QuestionHeader';
import OptionCard from '../components/OptionCard';
import QuizEndPopup from '../components/QuizEndPopup';

export default function QuestionPanel() {
    const router = useRouter();
    const { roomCode, isHost, setFinalReport } = useGameStore(); 

    // 🟢 EXAM STATE
    const [questionsList, setQuestionsList] = useState([]); 
    const [currentIndex, setCurrentIndex] = useState(0);    
    const [answersMap, setAnswersMap] = useState({});       
    
    const [timeLeft, setTimeLeft] = useState(0); 
    
    const [isGameOver, setIsGameOver] = useState(false); 
    const [isSubmitting, setIsSubmitting] = useState(false); // Double click rokne ke liye
    const hasFiredGameOver = useRef(false);

    // Hardware Back Button Disable (Back jane se rokna)
    useEffect(() => {
        const backAction = () => true;
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    // 🟢 HISSA 1: LISTENER (Popup aur Data ke liye)
    useEffect(() => {
        console.log("👂 QuestionPanel: Listening for events...");

        const handleStartExam = (data) => {
            console.log("✅ BAM! GOT THE EXAM DATA:", data);
            setQuestionsList(data.questions || []);
            setTimeLeft((data.totalDuration || 15) * 60); 
            setCurrentIndex(0);
            setAnswersMap({});
            setIsSubmitting(false);
        };

        const handleGameOver = (data) => {
            console.log("🏆 EXAM RESULT RECEIVED:", data);
            if (hasFiredGameOver.current) return; 
            
            hasFiredGameOver.current = true;
            setIsSubmitting(false);
            setFinalReport(data); 
            setIsGameOver(true);  // 🟢 FIX 1: Ab popup 100% aayega
        };

        socketService.on("start_exam", handleStartExam); 
        socketService.on("game_over", handleGameOver);

        return () => {
            console.log("🛑 QuestionPanel: Stopped listening.");
            socketService.off("start_exam", handleStartExam);
            socketService.off("game_over", handleGameOver);
        };
    }, [setFinalReport]); 

    // 🟢 HISSA 2: FETCHER (Paper Maangne wala logic)
    useEffect(() => {
        if (isHost) return; // Host paper nahi mangega

        if (!roomCode) return; // Room code jab tak na aaye wait karo

        socketService.connect(); 

        const timer = setTimeout(() => {
            console.log(`📢 PLAYER READY! Backend se paper maang rahe hain for Room: ${roomCode}`);
            socketService.fetchExamPaper(roomCode);
        }, 500);

        return () => clearTimeout(timer);

    }, [roomCode, isHost]);

    // 🟢 Global Timer Logic
    useEffect(() => {
        if (isGameOver || questionsList.length === 0 || isHost) return;

        if (timeLeft <= 0) {
            handleFinalSubmit(); 
            return;
        }

        const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, isGameOver, questionsList, isHost]);


    // 🟢 NAVIGATION & SUBMIT HANDLERS
    const handleOptionSelect = useCallback((option) => {
        if (isGameOver || isHost) return;
        
        // 🟢 FIX 2: Answers ko asli Database ID ke against save karo taaki "0 Correct" na aaye
        const currentQ = questionsList[currentIndex];
        if (currentQ && currentQ.id) {
            setAnswersMap(prev => ({ ...prev, [currentQ.id]: option }));
        }
    }, [currentIndex, isGameOver, isHost, questionsList]);

    const handleNext = () => {
        if (currentIndex < questionsList.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleFinalSubmit = () => {
        if (isGameOver || isHost || isSubmitting) return;
        
        setIsSubmitting(true); // Button Loading mode mein chala jayega
        console.log("📤 Submitting Exam...", answersMap);
        socketService.submitExam(roomCode, answersMap); 
    };

    // --- RENDERING VIEWS ---
    if (questionsList.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-[#050B18] items-center justify-center">
                <View className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <Text className="text-indigo-400 font-[Manrope-Bold] text-xl animate-pulse">Loading Exam...</Text>
            </SafeAreaView>
        );
    }

    const currentQuestion = questionsList[currentIndex];
    const isLastQuestion = currentIndex === questionsList.length - 1;

    return (
        <SafeAreaView className="flex-1 bg-[#050B18]">
            <QuizEndPopup
                visible={isGameOver} 
                onViewResults={() => {
                    setIsGameOver(false); 
                    router.push('/player-results'); 
                }}
            />

            <QuestionHeader
                qIndex={currentIndex + 1}
                totalQs={questionsList.length}
                timeLeft={timeLeft}
            />

            <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Question Box */}
                <View className="bg-[#0F172A]/80 border border-gray-800 p-8 rounded-[32px] mb-8 min-h-[160px] justify-center shadow-lg shadow-black/50">
                    <Text className="text-white font-[Manrope-Bold] text-2xl text-left leading-10">
                        {currentQuestion.questionText}
                    </Text>
                </View>

                {/* Options List */}
                <View className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                        <OptionCard
                            key={`opt-${currentIndex}-${index}`}
                            option={option}
                            index={index}
                            // 🟢 RENDERING FIX: Highlight checking also uses exact Database ID
                            isSelected={answersMap[currentQuestion.id] === option}
                            isDisabled={isGameOver || isHost}
                            onPress={handleOptionSelect}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* 🟢 BOTTOM NAVIGATION CONTROLS */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-[#050B18]/95 border-t border-gray-900 flex-row justify-between items-center">
                
                {/* PREV BUTTON */}
                <TouchableOpacity 
                    onPress={handlePrev} 
                    disabled={currentIndex === 0 || isGameOver}
                    className={`flex-row items-center justify-center w-14 h-14 rounded-2xl border ${currentIndex === 0 ? 'border-gray-800 bg-gray-900/50' : 'border-indigo-500/30 bg-indigo-500/10'}`}
                >
                    <ArrowLeft size={24} color={currentIndex === 0 ? "#4B5563" : "#818CF8"} />
                </TouchableOpacity>

                {/* NEXT OR SUBMIT BUTTON */}
                {isLastQuestion ? (
                    <TouchableOpacity 
                        onPress={handleFinalSubmit}
                        disabled={isGameOver || isSubmitting}
                        className={`flex-1 ml-4 h-14 rounded-2xl flex-row items-center justify-center shadow-lg ${isSubmitting ? 'bg-gray-600' : 'bg-[#22c55e] shadow-green-900/40'}`}
                    >
                        <Text className="text-white font-[Manrope-Bold] text-lg mr-2">
                            {isSubmitting ? "SUBMITTING..." : "SUBMIT EXAM"}
                        </Text>
                        {isSubmitting ? <ActivityIndicator size="small" color="white" /> : <CheckCircle size={20} color="white" />}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        onPress={handleNext}
                        disabled={isGameOver}
                        className="flex-1 ml-4 h-14 rounded-2xl flex-row items-center justify-center bg-indigo-600 shadow-lg shadow-indigo-900/40"
                    >
                        <Text className="text-white font-[Manrope-Bold] text-lg mr-2">NEXT</Text>
                        <ArrowRight size={20} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}