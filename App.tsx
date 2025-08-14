import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import * as Sentry from "@sentry/react-native";

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

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Fallback logging function
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logEntry]);
    console.log(message);
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        addLog('🚀 App initialization started');
        
        // Initialize Sentry first
        addLog('🔧 Initializing Sentry...');
        try {
          Sentry.init({
            dsn: 'https://8098766737acb190f51b8ecf8f349cb3@o4509841318608896.ingest.de.sentry.io/4509841326211152',
            sendDefaultPii: true,
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1,
            integrations: [Sentry.mobileReplayIntegration()],
          });
          addLog('✅ Sentry initialized successfully');
        } catch (sentryError) {
          addLog(`❌ Sentry initialization failed: ${sentryError}`);
        }
        
        // Check if environment variables are loaded
        addLog('📱 Checking environment variables...');
        const envCheck = {
          hasOpenAI: !!process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY,
          hasAnthropic: !!process.env.EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY,
          hasGoogle: !!process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY,
          hasElevenLabs: !!process.env.EXPO_PUBLIC_VIBECODE_ELEVENLABS_API_KEY,
        };
        addLog(`📱 Environment check: ${JSON.stringify(envCheck)}`);

        // Add a small delay to ensure proper initialization
        addLog('⏳ Waiting for initialization...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        addLog('✅ App initialization completed');
        setIsReady(true);
      } catch (err) {
        addLog(`❌ App initialization error: ${err}`);
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
        <Button 
          title="Test Sentry Now" 
          onPress={() => { 
            console.log('🧪 Manual Sentry test triggered');
            Sentry.captureException(new Error('Manual test error from loading screen'));
          }}
          color="white"
        />
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
        
        {/* Log Viewer */}
        <View style={{ marginTop: 20, maxHeight: 200, width: '100%' }}>
          <Text style={{ color: 'white', fontSize: 14, textAlign: 'center', marginBottom: 10 }}>
            Debug Logs:
          </Text>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 5, maxHeight: 150 }}>
            {logs.map((log, index) => (
              <Text key={index} style={{ color: 'white', fontSize: 10, marginBottom: 2 }}>
                {log}
              </Text>
            ))}
          </View>
        </View>
        
        <Button 
          title="Test Sentry" 
          onPress={() => { Sentry.captureException(new Error('Test error from error screen')) }}
          color="white"
        />
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

// Wrap the app with Sentry
export default Sentry.wrap(AppContent);