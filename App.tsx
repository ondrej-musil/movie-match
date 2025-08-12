import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 App initialization started');
        
        // Check if environment variables are loaded
        console.log('📱 Environment check:', {
          hasOpenAI: !!process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY,
          hasAnthropic: !!process.env.EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY,
          hasGoogle: !!process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY,
          hasElevenLabs: !!process.env.EXPO_PUBLIC_VIBECODE_ELEVENLABS_API_KEY,
        });

        // Add a small delay to ensure proper initialization
        console.log('⏳ Waiting for initialization...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ App initialization completed');
        setIsReady(true);
      } catch (err) {
        console.error('❌ App initialization error:', err);
        setError('Failed to initialize app');
        // Still set ready to true so user can see error
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    console.log('🔄 Showing loading screen');
    return (
      <View style={{ flex: 1, backgroundColor: '#D32F2F', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 18 }}>Loading...</Text>
        <Text style={{ color: 'white', fontSize: 14, marginTop: 10 }}>Please wait while we initialize the app</Text>
      </View>
    );
  }

  if (error) {
    console.log('❌ Showing error screen:', error);
    return (
      <View style={{ flex: 1, backgroundColor: '#D32F2F', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
          {error}
        </Text>
        <Text style={{ color: 'white', fontSize: 14, textAlign: 'center', marginTop: 10 }}>
          Please check your internet connection and try again.
        </Text>
        <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
          If the problem persists, please contact support.
        </Text>
      </View>
    );
  }

  console.log('🎬 Rendering main app');
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
