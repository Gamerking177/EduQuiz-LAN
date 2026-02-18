import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import "../global.css";

export default function HomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-[#020617]">

            {/* Top glow */}
            <LinearGradient
                colors={["#0F172A", "transparent"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.6 }}
                className="absolute top-0 w-full h-[55%]"
            />

            <View className="flex-1 px-6 pt-16">

                {/* Title Section */}
                <View className="items-center mb-16 ">
                    <Text className="text-white text-title font-manropeBold">
                        EduQuiz LAN
                    </Text>
                    <Text className="text-subtitle text-[#9CA3AF] font-manrope mt-2">
                        Play quizzes offline
                    </Text>
                </View>

                {/* Buttons */}
                <View className="flex-1 justify-center">
                    <View className="gap-4">

                        {/* Create Game */}
                        <Pressable
                            onPress={() => router.push("/create-game")}
                            className="rounded-xl border border-[#4F46E5] bg-[#0B1220]/60 p-5"
                        >
                            <Text className="text-white text-button font-manropeSemiBold">
                                Create Game
                            </Text>
                            <Text className="text-subtitle text-textSecondary font-manrope mt-1">
                                Host a quiz for others
                            </Text>
                        </Pressable>

                        {/* Join Game */}
                        <Pressable
                            onPress={() => router.push("/join-game")}
                            className="rounded-xl border border-[#1E293B] bg-[#0B1220]/40 p-5"
                        >
                            <Text className="text-white text-button font-manropeSemiBold">
                                Join Game
                            </Text>
                            <Text className="text-subtitle text-textSecondary font-manrope mt-1">
                                Enter a room code
                            </Text>
                        </Pressable>
                    </View>
                </View>

            </View>
        </SafeAreaView>
    );
}
