import React, { memo } from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { Code2, Database, Network, Globe, Cpu, Braces } from 'lucide-react-native';

const categories = [
    { id: 'programming', label: 'Programming', icon: Code2 },
    { id: 'dsa', label: 'Data Structures (DSA)', icon: Braces },
    { id: 'dbms', label: 'DBMS & SQL', icon: Database },
    { id: 'webdev', label: 'Web Development', icon: Globe },
    { id: 'networks', label: 'Computer Networks', icon: Network },
    { id: 'os', label: 'Operating Systems', icon: Cpu },
];

const CategorySelector = ({ selectedCategory, onSelectCategory }) => {
    return (
        <View className="mb-4 mt-2">
            <Text className="text-gray-400 font-[Manrope-Medium] mb-3 ml-1 text-sm">Select Subject Category</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.label;
                    
                    return (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => onSelectCategory(cat.label)}
                            activeOpacity={0.7}
                            // 🟢 Shadow hatadi gayi hai
                            className={`flex-row items-center px-4 py-2.5 rounded-full mr-3 border transition-all ${
                                isActive 
                                ? 'bg-indigo-600 border-indigo-500' 
                                : 'bg-[#050B18] border-gray-800'
                            }`}
                        >
                            <Icon size={16} color={isActive ? "white" : "#9ca3af"} />
                            <Text className={`ml-2 font-[Manrope-Medium] text-sm ${
                                isActive ? 'text-white' : 'text-gray-400'
                            }`}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default memo(CategorySelector);