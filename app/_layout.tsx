import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SystemUI from "expo-system-ui";
import { View } from "react-native";

// Set background color as early as possible
SystemUI.setBackgroundColorAsync("#FFC914");
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as SplashScreen from "expo-splash-screen";
import { useState } from "react";
import { useAuthStore } from "@store/auth.store";
import "../src/i18n";
import "../global.css";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

export default function RootLayout() {
  const { hydrate, isHydrated } = useAuthStore();
  const [isTimerReady, setIsTimerReady] = useState(false);

  useEffect(() => {
    void hydrate();
    const timer = setTimeout(() => {
      setIsTimerReady(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated && isTimerReady) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated, isTimerReady]);

  if (!isHydrated || !isTimerReady) {
    return <View style={{ flex: 1, backgroundColor: "#FFC914" }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#FFC914" }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "#FFC914",
              },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="property/[id]" />
          </Stack>
          <Toast />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
