import { useEffect, useCallback } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";

// Splash screen ko auto hide hone se rok dete hain
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    ManropeRegular: require("./assets/fonts/Manrope-Regular.ttf"),
    ManropeMedium: require("./assets/fonts/Manrope-Medium.ttf"),
    ManropeSemiBold: require("./assets/fonts/Manrope-SemiBold.ttf"),
    ManropeBold: require("./assets/fonts/Manrope-Bold.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync(); // fonts ready → splash hide
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // jab tak font load nahi hota blank rakho (native splash dikhega)
  }

  return (
    <View onLayout={onLayoutRootView}>
      <Slot /> 
    </View>
  );
}
