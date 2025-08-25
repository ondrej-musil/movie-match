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

function App() {
  console.log('🚀 App component rendering...');
  
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  console.log('📱 State initialized - isReady:', isReady, 'error:', error);

  // Fallback logging function
  const addLog = (message: string) => {
    console.log('📝 addLog called with:', message);
    try {
      setLogs(prev => {
        console.log('🔄 Updating logs array...');
        const newLogs = [...prev, `${new Date().toISOString()}: ${message}`];
        console.log('✅ Logs updated, new length:', newLogs.length);
        return newLogs;
      });
    } catch (err) {
      console.log('❌ Error in addLog:', err);
    }
  };

  // Function to send automatic Sentry events on every app launch
  const sendAutomaticSentryEvent = async () => {
    try {
      console.log('📤 Sending automatic Sentry event...');
      addLog('📤 Sending automatic Sentry event...');
      
      // Get current timestamp
      const launchTime = new Date().toISOString();
      
      // Send main app launch event
      Sentry.captureEvent({
        message: '🚀 App Launched Successfully',
        level: 'info',
        tags: {
          event_type: 'app_launch',
          app_version: '1.0.1',
          build_number: '47',
          platform: 'react-native',
          timestamp: launchTime
        },
        extra: {
          launch_time: launchTime,
          app_state: 'active',
          session_id: Date.now().toString(),
          device_info: {
            platform: 'react-native',
            version: '1.0.1',
            build: '47'
          }
        },
        contexts: {
          app: {
            app_version: '1.0.1',
            build: '47',
            name: '2-movie-match'
          },
          device: {
            name: 'react-native',
            version: '1.0.1'
          }
        }
      });
      
      // Send additional context information
      Sentry.setTag('app_launch_count', 'incremental');
      Sentry.setTag('last_launch_time', launchTime);
      
      // Set user context for tracking
      Sentry.setUser({
        id: 'app-user',
        username: 'movie-match-user',
        email: 'user@moviematch.cz'
      });
      
      // Set additional context
      Sentry.setContext('app_launch', {
        timestamp: launchTime,
        version: '1.0.1',
        build: '47',
        platform: 'react-native',
        session_id: Date.now().toString()
      });
      
      // Send a breadcrumb for the launch
      Sentry.addBreadcrumb({
        category: 'app',
        message: 'App launched successfully',
        level: 'info',
        data: {
          launch_time: launchTime,
          version: '1.0.1',
          build: '47'
        }
      });
      
      console.log('✅ Automatic Sentry event sent successfully');
      addLog('✅ Automatic Sentry event sent successfully');
      
    } catch (error) {
      console.log('❌ Failed to send automatic Sentry event:', error);
      addLog(`❌ Failed to send automatic Sentry event: ${error}`);
      // Try to capture the error itself
      try {
        Sentry.captureException(error);
      } catch (sentryError) {
        console.log('❌ Failed to capture Sentry error:', sentryError);
      }
    }
  };

  useEffect(() => {
    console.log('🔧 useEffect triggered');
    const initializeApp = async () => {
      console.log('🚀 initializeApp function called');
      try {
        console.log('📝 Adding first log...');
        addLog('🚀 App initialization started');
        console.log('✅ First log added successfully');
        
        // Initialize Sentry first
        console.log('🔧 Starting Sentry initialization...');
        addLog('🔧 Initializing Sentry...');
        try {
          console.log('📡 Calling Sentry.init...');
          Sentry.init({
            dsn: 'https://8098766737acb190f51b8ecf8f349cb3@o4509841318608896.ingest.de.sentry.io/4509841326211152',
            sendDefaultPii: true,
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1,
            integrations: [Sentry.mobileReplayIntegration()],
          });
          console.log('✅ Sentry.init completed');
          addLog('✅ Sentry initialized successfully');
          
          // Send automatic Sentry event on every app launch
          console.log('📤 Sending automatic Sentry event...');
          await sendAutomaticSentryEvent();
          console.log('✅ Automatic Sentry event sent');
          
          // Test Sentry immediately to verify it's working
          console.log('📤 Sending test message to Sentry...');
          Sentry.captureMessage('🚀 App started successfully', 'info');
          console.log('✅ Test message sent');
          addLog('📤 Sent test message to Sentry');
          
          // Send additional automatic events to ensure Sentry is working
          try {
            Sentry.captureMessage('🔍 Testing Sentry integration', 'debug');
            addLog('📤 Sent debug message to Sentry');
            
            // Set user context
            Sentry.setUser({ id: 'test-user', email: 'test@example.com' });
            addLog('👤 Set user context in Sentry');
            
            // Set extra context
            Sentry.setExtra('app_version', '1.0.1');
            Sentry.setExtra('build_number', '47');
            addLog('📋 Set extra context in Sentry');
            
            // Send a breadcrumb
            Sentry.addBreadcrumb({
              category: 'app',
              message: 'App initialization started',
              level: 'info',
            });
            addLog('🍞 Added breadcrumb to Sentry');
            
          } catch (eventError) {
            console.log('❌ Failed to send additional Sentry events:', eventError);
            addLog(`❌ Failed to send additional Sentry events: ${eventError}`);
          }
        } catch (sentryError) {
          console.log('❌ Sentry error:', sentryError);
          addLog(`❌ Sentry initialization failed: ${sentryError}`);
          Sentry.captureException(sentryError);
        }
        
        console.log('📱 About to check environment variables...');
        addLog('📱 About to check environment variables...');
        
        let envCheck;
        try {
          console.log('📱 Environment check starting...');
          addLog('📱 Environment check starting...');
          
          // Check if environment variables are loaded
          addLog('📱 Checking environment variables...');
          Sentry.captureMessage('📱 Checking environment variables...', 'info');
          
          envCheck = {
            hasOpenAI: !!process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY,
            hasAnthropic: !!process.env.EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY,
            hasGoogle: !!process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY,
            hasElevenLabs: !!process.env.EXPO_PUBLIC_VIBECODE_ELEVENLABS_API_KEY,
          };
          
          console.log('📱 Environment check completed successfully:', envCheck);
          addLog('📱 Environment check completed successfully');
          
        } catch (error) {
          console.log('❌ Environment check failed:', error);
          addLog(`❌ Environment check failed: ${error}`);
          Sentry.captureException(error);
          throw error; // Re-throw to maintain the original flow
        }
        
        // Now envCheck is accessible here
        console.log('📱 Environment check result:', envCheck);
        addLog(`📱 Environment check: ${JSON.stringify(envCheck)}`);
        Sentry.setContext('environment', envCheck);

        // Add a small delay to ensure proper initialization
        console.log('⏳ Starting delay...');
        addLog('⏳ Waiting for initialization...');
        
        try {
          console.log('📤 Sending waiting message...');
          addLog('🔍 Attempting to send waiting message to Sentry...');
          Sentry.captureMessage('⏳ Waiting for initialization...', 'info');
          console.log('✅ Waiting message sent');
          addLog('✅ Waiting message sent to Sentry successfully');
        } catch (sentryError) {
          console.log('❌ Waiting message error:', sentryError);
          addLog(`❌ Waiting message failed: ${sentryError}`);
          Sentry.captureException(sentryError);
        }
        
        console.log('⏳ Waiting 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Delay completed');
        
        console.log('✅ Setting app initialization completed...');
        addLog('✅ App initialization completed');
        
        // Send final automatic Sentry event to confirm successful launch
        try {
          console.log('📤 Sending final automatic Sentry event...');
          await sendAutomaticSentryEvent();
          console.log('✅ Final automatic Sentry event sent');
          addLog('✅ Final automatic Sentry event sent');
        } catch (error) {
          console.log('❌ Failed to send final automatic Sentry event:', error);
          addLog(`❌ Failed to send final automatic Sentry event: ${error}`);
        }
        
        // Add specific error handling to pinpoint the crash
        try {
          console.log('📤 Sending completion message...');
          addLog('🔍 Attempting to send Sentry message...');
          Sentry.captureMessage('✅ App initialization completed', 'info');
          console.log('✅ Completion message sent');
          addLog('✅ Sentry message sent successfully');
        } catch (sentryError) {
          console.log('❌ Completion message error:', sentryError);
          addLog(`❌ Sentry message failed: ${sentryError}`);
          Sentry.captureException(sentryError);
        }
        
        try {
          console.log('🔍 Setting isReady to true...');
          addLog('🔍 Attempting to set isReady to true...');
          setIsReady(true);
          console.log('✅ isReady set to true successfully');
          addLog('✅ isReady set to true successfully');
        } catch (stateError) {
          console.log('❌ State error:', stateError);
          addLog(`❌ Setting isReady failed: ${stateError}`);
          Sentry.captureException(stateError);
          // Still try to set ready so user can see the error
          console.log('🔄 Trying to set isReady again...');
          setIsReady(true);
        }
      } catch (err) {
        console.log('❌ Main error in initializeApp:', err);
        addLog(`❌ App initialization error: ${err}`);
        Sentry.captureException(err);
        setError('Failed to initialize app');
        // Still set ready to true so user can see error
        console.log('🔄 Setting isReady to true despite error...');
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
          onPress={() => { 
            Sentry.captureException(new Error('Test error from error screen'));
          }}
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
export default Sentry.wrap(App);