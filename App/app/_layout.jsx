import { Stack } from "expo-router";
import { View } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../global.css";

// 🟢 Helper aur Store imports
import useGameStore from "../store/useGameStore";
import { getOrCreateDeviceId } from "../utils/helper";

const queryClient = new QueryClient();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const setDeviceId = useGameStore((state) => state.setDeviceId);

  const [loaded, error] = useFonts({
    'Manrope-Bold': require('../assets/fonts/Manrope-Bold.ttf'),
    'Manrope-SemiBold': require('../assets/fonts/Manrope-SemiBold.ttf'),
    'Manrope-Medium': require('../assets/fonts/Manrope-Medium.ttf'),
    'Manrope-Regular': require('../assets/fonts/Manrope-Regular.ttf'),
  });

  // 🟢 Sirf Device ID ka log rakha hai
  useEffect(() => {
    const initDevice = async () => {
      try {
        const id = await getOrCreateDeviceId();
        setDeviceId(id);
        console.log("📱 Device ID:", id); // 🟢 Sirf ye dikhega terminal mein
      } catch (err) {
        // Error log zaroori hai agar fail ho jaye
        console.error("❌ Device ID fail:", err);
      }
    };
    initDevice();
  }, [setDeviceId]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: '#050B18' }
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="create-quiz" />
        <Stack.Screen name="join-game" />
        <Stack.Screen name="waiting-area" />
      </Stack>
    </QueryClientProvider>
  );
}