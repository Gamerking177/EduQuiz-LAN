import React, { useState, useEffect, useCallback, useRef } from 'react'; // 🟢 STEP 1: useRef import kiya
import { View, Text, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// import { Trophy } from 'lucide-react-native'; // Ye abhi use nahi ho raha toh hata sakte ho

import socketService from '../utils/socket';
import useGameStore from '../store/useGameStore';

// Components
import QuestionHeader from '../components/QuestionHeader';
import OptionCard from '../components/OptionCard';
import QuizEndPopup from '../components/QuizEndPopup';

export default function QuestionPanel() {
    const router = useRouter();
    // 🟢 Zustand se naya function bhi nikal liya
    const { roomCode, isHost, setFinalReport } = useGameStore(); 

    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const [timeLeft, setTimeLeft] = useState(30);
    const [qIndex, setQIndex] = useState(0);
    const [totalQs, setTotalQs] = useState(0);

    // 🟢 Popup control karne ke liye state
    const [isGameOver, setIsGameOver] = useState(false); 

    // 🟢 STEP 2: Ye Gatekeeper/Lock hai. Ek baar game over ho gaya toh ye true ho jayega.
    const hasFiredGameOver = useRef(false);

    useEffect(() => {
        if (isHost) {
            router.replace('/host-live-leaderboard');
        }
    }, [isHost]);

    useEffect(() => {
        const backAction = () => true;
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    // 🟢 Socket Logic
    useEffect(() => {
        // Handle new question
        const handleNewQuestion = (data) => {
            setCurrentQuestion(data);
            setQIndex(data.qIndex + 1);
            setTotalQs(data.total);
            setTimeLeft(data.timeLimit || 30);
            setSelectedOption(null);
            setIsAnswered(false);
        };

        // Handle game over
        const handleGameOver = (data) => {
            // 🟢 STEP 3: Agar lock pehle se laga hai (yani event pehle aa chuka hai), toh turant wapas laut jao!
            if (hasFiredGameOver.current) {
                console.log("Blocked duplicate game_over event from Host's 'End Game' button!");
                return; 
            }

            // 🟢 STEP 4: Lock laga do taaki agla koi event (jaise Host ka End Game) iske baad na chale.
            hasFiredGameOver.current = true;

            setFinalReport(data); // 🟢 1. Zustand store mein report card save karo
            setIsGameOver(true);  // 🟢 2. Popup dikhane ke liye state true karo
        };

        // Listeners
        socketService.on("new_question", handleNewQuestion);
        socketService.on("game_over", handleGameOver);

        return () => {
            socketService.off("new_question", handleNewQuestion);
            socketService.off("game_over", handleGameOver);
        };
    }, [roomCode, isHost, setFinalReport]);

    // 🟢 Timer Logic
    useEffect(() => {
        if (isAnswered || isGameOver || !currentQuestion) return;

        if (timeLeft <= 0) {
            if (!isHost) {
                handleOptionSelect("__SKIP__");
            }
            return;
        }

        const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, isAnswered, currentQuestion, isGameOver, isHost]);

    const handleOptionSelect = useCallback((option) => {
        if (isAnswered || isGameOver || isHost) return;

        setSelectedOption(option);
        setIsAnswered(true);

        socketService.submitAnswer(roomCode, option);
    }, [isAnswered, isGameOver, roomCode, isHost]);


    // --- RENDERING VIEWS ---

    if (!currentQuestion) {
        return (
            <SafeAreaView className="flex-1 bg-[#050B18] items-center justify-center">
                <View className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <Text className="text-indigo-400 font-[Manrope-Bold] text-xl animate-pulse">Loading Question...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#050B18]">
            
            {/* 🟢 FIX: Popup ko yahan Return ke andar lagaya hai */}
            <QuizEndPopup
                visible={isGameOver} // isQuizFinished ki jagah isGameOver use kiya
                onViewResults={() => {
                    setIsGameOver(false); // Popup band karo
                    router.push('/player-results'); // Agle page pe bhejo
                }}
            />

            {/* Header (Question No & Timer) */}
            <QuestionHeader
                qIndex={qIndex}
                totalQs={totalQs}
                timeLeft={timeLeft}
            />

            <View className="flex-1 px-6 pt-8">
                {/* Question Box */}
                <View className="bg-[#0F172A]/80 border border-gray-800 p-8 rounded-[32px] mb-10 min-h-[160px] justify-center shadow-lg shadow-black/50">
                    <Text className="text-white font-[Manrope-Bold] text-2xl text-left leading-10">
                        {currentQuestion.questionText}
                    </Text>
                </View>

                {/* Options List */}
                <View className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                        <OptionCard
                            key={`opt-${index}`}
                            option={option}
                            index={index}
                            isSelected={selectedOption === option}
                            isDisabled={isAnswered || isHost}
                            onPress={handleOptionSelect}
                        />
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}