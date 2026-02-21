import React, { memo } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Trash2, CheckCircle2, Circle, PlusCircle, X } from 'lucide-react-native';

const QuestionCard = ({ index, questionData, updateQuestion, removeQuestion }) => {

    // 🟢 Safe Toggle Logic: navigation ko touch nahi karega
    const toggleFormat = (format) => {
        if (format === 'True/False') {
            updateQuestion({
                format: 'True/False',
                options: ['True', 'False'],
                correctAnswer: 0
            });
        } else {
            updateQuestion({
                format: 'MCQ',
                options: ['', '', '', ''],
                correctAnswer: 0
            });
        }
    };

    const handleOptionChange = (text, optIdx) => {
        const newOptions = [...questionData.options];
        newOptions[optIdx] = text;
        updateQuestion({ options: newOptions });
    };

    return (
        <View 
            className="bg-[#111827] border border-gray-800 p-6 rounded-[32px] mb-8"
            style={{ borderStyle: 'solid' }} 
        >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-5">
                <Text className="text-indigo-400 font-[Manrope-Bold] text-lg">Question {index + 1}</Text>
                <TouchableOpacity onPress={removeQuestion} className="bg-red-500/10 p-2 rounded-full">
                    <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>

            {/* Answer Format Toggle */}
            <View className="flex-row bg-[#050B18] p-1.5 rounded-2xl mb-6 border border-gray-800">
                {['MCQ', 'True/False'].map((f) => (
                    <TouchableOpacity
                        key={`toggle-${f}`}
                        onPress={() => toggleFormat(f)}
                        className={`flex-1 py-3 rounded-xl items-center ${questionData.format === f ? 'bg-indigo-600' : ''}`}
                    >
                        <Text className={`font-[Manrope-Bold] text-xs ${questionData.format === f ? 'text-white' : 'text-gray-500'}`}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Question Text */}
            <TextInput
                placeholder="Type your question here..."
                placeholderTextColor="#4B5563"
                value={questionData.text}
                onChangeText={(text) => updateQuestion({ text })}
                className="bg-[#050B18] text-white p-4 rounded-2xl border border-gray-800 font-[Manrope-SemiBold] mb-6"
                multiline
                textAlignVertical="top"
            />

            {/* Difficulty Selector */}
            <View className="mb-6">
                <Text className="text-gray-400 font-[Manrope-Bold] text-[10px] uppercase tracking-widest mb-3">Difficulty</Text>
                <View className="flex-row gap-2">
                    {['Easy', 'Medium', 'Hard'].map((level) => (
                        <TouchableOpacity
                            key={`diff-${level}`}
                            onPress={() => updateQuestion({ difficulty: level })}
                            className={`flex-1 py-2 rounded-xl items-center border ${questionData.difficulty === level ? 'bg-indigo-600 border-indigo-500' : 'bg-[#050B18] border-gray-800'}`}
                        >
                            <Text className={`font-[Manrope-Bold] text-xs ${questionData.difficulty === level ? 'text-white' : 'text-gray-400'}`}>{level}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Options Management */}
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-400 font-[Manrope-Bold] text-[10px] uppercase tracking-widest">Options</Text>
                {questionData.format === 'MCQ' && questionData.options.length < 6 && (
                    <TouchableOpacity onPress={() => updateQuestion({ options: [...questionData.options, ''] })} className="flex-row items-center">
                        <PlusCircle size={14} color="#6366f1" />
                        <Text className="text-indigo-500 font-[Manrope-Bold] text-xs ml-1">Add Option</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Options List */}
            {questionData.options.map((option, idx) => (
                <View key={`q-${index}-opt-${idx}`} className="flex-row items-center mb-3">
                    <TouchableOpacity onPress={() => updateQuestion({ correctAnswer: idx })}>
                        {questionData.correctAnswer === idx ?
                            <CheckCircle2 size={24} color="#22c55e" /> :
                            <Circle size={24} color="#374151" />
                        }
                    </TouchableOpacity>
                    <View className={`flex-1 flex-row items-center bg-[#050B18] border rounded-xl ml-3 ${questionData.correctAnswer === idx ? 'border-green-500/50' : 'border-gray-800'}`}>
                        <TextInput
                            value={option}
                            editable={questionData.format === 'MCQ'}
                            onChangeText={(t) => handleOptionChange(t, idx)}
                            placeholder={`Option ${idx + 1}`}
                            placeholderTextColor="#374151"
                            className="flex-1 text-white p-3 font-[Manrope-Regular]"
                        />
                        {questionData.options.length > 2 && questionData.format === 'MCQ' && (
                            <TouchableOpacity 
                                onPress={() => {
                                    const newOpts = questionData.options.filter((_, i) => i !== idx);
                                    updateQuestion({ options: newOpts });
                                }} 
                                className="pr-3"
                            >
                                <X size={16} color="#4B5563" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );
};

export default memo(QuestionCard); // 🟢 Memo use karo rerender crash bachane ke liye