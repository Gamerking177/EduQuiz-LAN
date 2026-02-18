import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import '../global.css'

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function SplashScreen() {
  const router = useRouter();

  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslate = useSharedValue(20);

  useEffect(() => {
    logoScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.exp) });
    logoOpacity.value = withTiming(1, { duration: 900 });

    textOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    textTranslate.value = withDelay(600, withTiming(0, { duration: 600 }));

    const timer = setTimeout(() => {
      router.replace("/home");
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslate.value }],
  }));

 return (
  <View className="flex-1 bg-[#020617]">

    {/* Top glow */}
    <LinearGradient
      colors={["#0F172A", "transparent"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 0.7 }}
      style={{ position: "absolute", width: "100%", height: "65%" }}
    />

    {/* CENTER CONTENT WRAPPER */}
    <View className="flex-1 justify-center items-center px-6">
      <Animated.View style={logoStyle} className="items-center">
        <Image
          source={require("../assets/icon.png")}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={textStyle} className="mt-6 items-center">
        <Text className="text-white text-spscreen font-manropeSemiBold">
          EduQuiz LAN
        </Text>
      </Animated.View>
    </View>

    {/* Bottom version text */}
    <Text className="absolute bottom-10 self-center text-[#475569] text-xs font-manrope">
      v1.0.0
    </Text>
  </View>
);

}