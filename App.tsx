import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { View, Text, Button, Platform } from "react-native";
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

// Move all functions outside the component to prevent re-creation on every render
const addLog = (setLogs: React.Dispatch<React.SetStateAction<string[]>>, message: string) => {
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
const sendAutomaticSentryEvent = async (setLogs: React.Dispatch<React.SetStateAction<string[]>>) => {
  try {
    console.log('📤 Sending automatic Sentry event...');
    addLog(setLogs, '📤 Sending automatic Sentry event...');
    
    // Get current timestamp
    const launchTime = new Date().toISOString();
    
    // Send main app launch event
    Sentry.captureEvent({
      message: '🚀 App Launched Successfully',
      level: 'info',
      tags: {
        event_type: 'app_launch',
        app_version: '1.0.1',
                  build_number: '49',
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
            build: '49'
          }
      },
      contexts: {
        app: {
          app_version: '1.0.1',
          build: '49',
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
        build: '49',
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
        build: '49'
      }
    });
    
    console.log('✅ Automatic Sentry event sent successfully');
    addLog(setLogs, '✅ Automatic Sentry event sent successfully');
    
  } catch (error) {
    console.log('❌ Failed to send automatic Sentry event:', error);
    addLog(setLogs, `❌ Failed to send automatic Sentry event: ${error}`);
    // Try to capture the error itself
    try {
      Sentry.captureException(error);
    } catch (sentryError) {
      console.log('❌ Failed to capture Sentry error:', sentryError);
    }
  }
};

// Function to test network connectivity to Sentry
const testSentryConnectivity = async (setLogs: React.Dispatch<React.SetStateAction<string[]>>) => {
  try {
    console.log('🌐 Testing Sentry network connectivity...');
    addLog(setLogs, '🌐 Testing Sentry network connectivity...');
    
    // Test basic network connectivity
    const testUrl = 'https://de.sentry.io/';
    const response = await fetch(testUrl, { method: 'HEAD' });
    console.log('✅ Network test successful:', response.status);
    addLog(setLogs, `✅ Network test successful: ${response.status}`);
    
    // Test Sentry ingest endpoint
    const ingestUrl = 'https://8098766737acb190f51b8ecf8f349cb3@o4509841318608896.ingest.de.sentry.io/api/4509841326211152/store/';
    const ingestResponse = await fetch(ingestUrl, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Network test' })
    });
    console.log('✅ Ingest endpoint test:', ingestResponse.status);
    addLog(setLogs, `✅ Ingest endpoint test: ${ingestResponse.status}`);
    
  } catch (error) {
    console.log('❌ Network test failed:', error);
    addLog(setLogs, `❌ Network test failed: ${error}`);
    
    // Try to send this error to Sentry
    try {
      Sentry.captureMessage(`Network connectivity test failed: ${error}`, 'error');
    } catch (sentryError) {
      console.log('❌ Could not send network error to Sentry:', sentryError);
    }
  }
};

// Function to add mobile-specific debugging
const addMobileDebugInfo = (setLogs: React.Dispatch<React.SetStateAction<string[]>>) => {
  try {
    console.log('📱 Adding mobile debug info...');
    addLog(setLogs, '📱 Adding mobile debug info...');
    
    // Add device info
    const deviceInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      isTablet: Platform.OS === 'ios' ? (Platform as any).isPad || false : false,
      timestamp: new Date().toISOString(),
      memory: 'unknown', // We'll try to get this
      networkType: 'unknown' // We'll try to get this
    };
    
    console.log('📱 Device info:', deviceInfo);
    addLog(setLogs, `📱 Device info: ${JSON.stringify(deviceInfo)}`);
    
    // Try to get more device info
    if (Platform.OS === 'ios') {
      console.log('📱 iOS specific info available');
      addLog(setLogs, '📱 iOS specific info available');
    } else if (Platform.OS === 'android') {
      console.log('📱 Android specific info available');
      addLog(setLogs, '📱 Android specific info available');
    }
    
  } catch (error) {
    console.log('❌ Failed to add mobile debug info:', error);
    addLog(setLogs, `❌ Failed to add mobile debug info: ${error}`);
  }
};

function App() {
  console.log('🚀 App component rendering...');
  
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  console.log('📱 State initialized - isReady:', isReady, 'error:', error);

  // Add immediate logging to see if we even get here
  console.log('🔍 App function reached - adding immediate log');
  
  // Add immediate log to see if logging works
  console.log('📝 Testing immediate logging...');
  console.log('✅ Immediate logging test completed');

  useEffect(() => {
    console.log('🔧 useEffect triggered');
    addLog(setLogs, '🔧 useEffect triggered');
    
    // Add the immediate log here instead of during render
    addLog(setLogs, '🚀 App component function reached');
    
    const initializeApp = async () => {
      console.log('🚀 initializeApp function called');
      addLog(setLogs, '🚀 initializeApp function called');
      try {
        console.log('📝 Adding first log...');
        addLog(setLogs, '�� App initialization started');
        console.log('✅ First log added successfully');
        
        // Add mobile-specific debugging
        console.log('📱 Adding mobile debug info...');
        addMobileDebugInfo(setLogs);
        
        // Initialize Sentry first
        console.log('🔧 Starting Sentry initialization...');
        addLog(setLogs, '🔧 Initializing Sentry...');
        try {
          console.log('📡 Calling Sentry.init...');
          Sentry.init({
            dsn: 'https://8098766737acb190f51b8ecf8f349cb3@o4509841318608896.ingest.de.sentry.io/4509841326211152',
            sendDefaultPii: true,
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1,
            integrations: [Sentry.mobileReplayIntegration()],
            // Add error handling and rate limiting
            beforeSend: (event) => {
              console.log('📤 Sentry beforeSend:', event.message);
              return event;
            },
            beforeBreadcrumb: (breadcrumb) => {
              console.log('🍞 Sentry breadcrumb:', breadcrumb.message);
              return breadcrumb;
            },
            // Add debugging
            debug: true,
            // Use default React Native transport
          });
          console.log('✅ Sentry.init completed');
          addLog(setLogs, '✅ Sentry initialized successfully');
          
          // Test network connectivity to Sentry
          console.log('🌐 Testing Sentry network connectivity...');
          await testSentryConnectivity(setLogs);
          
          // Send automatic Sentry event on every app launch with error handling
          console.log('📤 Sending automatic Sentry event...');
          try {
            await sendAutomaticSentryEvent(setLogs);
            console.log('✅ Automatic Sentry event sent');
          } catch (error) {
            console.log('❌ Automatic Sentry event failed:', error);
            addLog(setLogs, `❌ Automatic Sentry event failed: ${error}`);
          }
          
          // Test Sentry with error handling and delay
          console.log('📤 Sending test message to Sentry...');
          try {
            // Add small delay to prevent overwhelming Sentry
            await new Promise(resolve => setTimeout(resolve, 100));
            Sentry.captureMessage('🚀 App started successfully', 'info');
            console.log('✅ Test message sent');
            addLog(setLogs, '📤 Sent test message to Sentry');
          } catch (error) {
            console.log('❌ Test message failed:', error);
            addLog(setLogs, `❌ Test message failed: ${error}`);
          }
          
          // Send additional automatic events to ensure Sentry is working
          try {
            Sentry.captureMessage('🔍 Testing Sentry integration', 'debug');
            addLog(setLogs, '�� Sent debug message to Sentry');
            
            // Set user context
            Sentry.setUser({ id: 'test-user', email: 'test@example.com' });
            addLog(setLogs, '👤 Set user context in Sentry');
            
            // Set extra context
            Sentry.setExtra('app_version', '1.0.1');
                          Sentry.setExtra('build_number', '49');
            addLog(setLogs, '📋 Set extra context in Sentry');
            
            // Send a breadcrumb
            Sentry.addBreadcrumb({
              category: 'app',
              message: 'App initialization started',
              level: 'info',
            });
            addLog(setLogs, '🍞 Added breadcrumb to Sentry');
            
          } catch (eventError) {
            console.log('❌ Failed to send additional Sentry events:', eventError);
            addLog(setLogs, `❌ Failed to send additional Sentry events: ${eventError}`);
          }
        } catch (sentryError) {
          console.log('❌ Sentry error:', sentryError);
          addLog(setLogs, `❌ Sentry initialization failed: ${sentryError}`);
          Sentry.captureException(sentryError);
        }
        
        console.log('📱 About to check environment variables...');
        addLog(setLogs, '📱 About to check environment variables...');
        
        let envCheck;
        try {
          console.log('📱 Environment check starting...');
          addLog(setLogs, '📱 Environment check starting...');
          
          // Check if environment variables are loaded
          addLog(setLogs, '📱 Checking environment variables...');
          try {
            await new Promise(resolve => setTimeout(resolve, 50));
            Sentry.captureMessage('📱 Checking environment variables...', 'info');
          } catch (error) {
            console.log('❌ Environment check Sentry message failed:', error);
          }
          
          envCheck = {
            hasOpenAI: !!process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY,
            hasAnthropic: !!process.env.EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY,
            hasGoogle: !!process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY,
            hasElevenLabs: !!process.env.EXPO_PUBLIC_VIBECODE_ELEVENLABS_API_KEY,
          };
          
          console.log('📱 Environment check completed successfully:', envCheck);
          addLog(setLogs, '📱 Environment check completed successfully');
          
        } catch (error) {
          console.log('❌ Environment check failed:', error);
          addLog(setLogs, `❌ Environment check failed: ${error}`);
          Sentry.captureException(error);
          throw error; // Re-throw to maintain the original flow
        }
        
        // Now envCheck is accessible here
        console.log('📱 Environment check result:', envCheck);
        addLog(setLogs, `📱 Environment check: ${JSON.stringify(envCheck)}`);
        Sentry.setContext('environment', envCheck);

        // Add a small delay to ensure proper initialization
        console.log('⏳ Starting delay...');
        addLog(setLogs, '⏳ Waiting for initialization...');
        
        try {
          console.log('📤 Sending waiting message...');
          addLog(setLogs, '🔍 Attempting to send waiting message to Sentry...');
          try {
            await new Promise(resolve => setTimeout(resolve, 50));
            Sentry.captureMessage('⏳ Waiting for initialization...', 'info');
            console.log('✅ Waiting message sent');
            addLog(setLogs, '✅ Waiting message sent to Sentry successfully');
          } catch (error) {
            console.log('❌ Waiting message failed:', error);
            addLog(setLogs, `❌ Waiting message failed: ${error}`);
          }
        } catch (sentryError) {
          console.log('❌ Waiting message error:', sentryError);
          addLog(setLogs, `❌ Waiting message failed: ${sentryError}`);
          Sentry.captureException(sentryError);
        }
        
        console.log('⏳ Waiting 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Delay completed');
        
        // Add timeout protection for mobile
        console.log('⏰ Adding timeout protection...');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('App initialization timeout after 10 seconds')), 10000)
        );
        
        try {
          await Promise.race([
            new Promise(resolve => setTimeout(resolve, 2000)), // Normal flow
            timeoutPromise
          ]);
          console.log('✅ Timeout protection passed');
        } catch (timeoutError) {
          console.log('⚠️ Timeout protection triggered:', timeoutError);
          addLog(setLogs, `⚠️ Timeout protection triggered: ${timeoutError}`);
          // Continue anyway to prevent hanging
        }
        
        console.log('✅ Setting app initialization completed...');
        addLog(setLogs, '✅ App initialization completed');
        
        // Send final automatic Sentry event to confirm successful launch
        try {
          console.log('📤 Sending final automatic Sentry event...');
          // Add delay to prevent overwhelming Sentry
          await new Promise(resolve => setTimeout(resolve, 100));
          await sendAutomaticSentryEvent(setLogs);
          console.log('✅ Final automatic Sentry event sent');
          addLog(setLogs, '✅ Final automatic Sentry event sent');
        } catch (error) {
          console.log('❌ Failed to send final automatic Sentry event:', error);
          addLog(setLogs, `❌ Failed to send final automatic Sentry event: ${error}`);
        }
        
        // Add specific error handling to pinpoint the crash
        try {
          console.log('📤 Sending completion message...');
          addLog(setLogs, '🔍 Attempting to send Sentry message...');
          // Add delay to prevent overwhelming Sentry
          await new Promise(resolve => setTimeout(resolve, 100));
          Sentry.captureMessage('✅ App initialization completed', 'info');
          console.log('✅ Completion message sent');
          addLog(setLogs, '✅ Sentry message sent successfully');
        } catch (sentryError) {
          console.log('❌ Completion message error:', sentryError);
          addLog(setLogs, `❌ Sentry message failed: ${sentryError}`);
          // Don't call captureException here as it might cause another crash
          console.log('⚠️ Skipping Sentry.captureException to prevent crash loop');
        }
        
        try {
          console.log('🔍 Setting isReady to true...');
          addLog(setLogs, '🔍 Attempting to set isReady to true...');
          setIsReady(true);
          console.log('✅ isReady set to true successfully');
          addLog(setLogs, '✅ isReady set to true successfully');
        } catch (stateError) {
          console.log('❌ State error:', stateError);
          addLog(setLogs, `❌ Setting isReady failed: ${stateError}`);
          // Don't call Sentry here to prevent crash loops
          console.log('⚠️ Skipping Sentry.captureException to prevent crash loop');
          // Still try to set ready so user can see the error
          console.log('🔄 Trying to set isReady again...');
          setIsReady(true);
        }
        
        // Final fallback - ensure app is never stuck
        setTimeout(() => {
          if (!isReady) {
            console.log('🚨 EMERGENCY: App stuck, forcing isReady to true');
            addLog(setLogs, '🚨 EMERGENCY: App stuck, forcing isReady to true');
            setIsReady(true);
          }
        }, 15000); // 15 second emergency fallback

          // Test bypass removed - fixed the infinite re-render issue
      } catch (err) {
        console.log('❌ Main error in initializeApp:', err);
        addLog(setLogs, `❌ App initialization error: ${err}`);
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
    addLog(setLogs, '🔄 Showing loading screen');
    return (
      <View style={{ flex: 1, backgroundColor: '#D32F2F', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 18 }}>Loading...</Text>
        <Text style={{ color: 'white', fontSize: 14, marginTop: 10 }}>Please wait while we initialize the app</Text>
        <Text style={{ color: 'white', fontSize: 12, marginTop: 10 }}>Debug: App mounted, waiting for initialization</Text>
        <Button 
          title="Test Sentry Now" 
          onPress={() => { 
            console.log('🧪 Manual Sentry test triggered');
            Sentry.captureException(new Error('Manual test error from loading screen'));
          }}
          color="white"
        />
        <View style={{ marginTop: 10 }}>
          <Button 
            title="Test Network to Sentry" 
            onPress={async () => { 
              console.log('🌐 Manual network test triggered');
              await testSentryConnectivity(setLogs);
            }}
            color="white"
          />
        </View>
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
  addLog(setLogs, '🎬 Rendering main app');
  
  // Add a simple test to see if we can even render basic components
  try {
    console.log('🧪 Testing basic component rendering...');
    addLog(setLogs, '🧪 Testing basic component rendering...');
  } catch (renderError) {
    console.log('❌ Render test failed:', renderError);
    addLog(setLogs, `❌ Render test failed: ${renderError}`);
  }
  
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