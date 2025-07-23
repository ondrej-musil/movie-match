import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useMovieMatchStore } from '../state/movieMatchStore';
import { Ionicons } from '@expo/vector-icons';

type JoinRoomScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'JoinRoom'>;

export default function JoinRoomScreen() {
  const navigation = useNavigation<JoinRoomScreenNavigationProp>();
  const { joinRoom, error, setError } = useMovieMatchStore();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinRoom = async () => {
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await joinRoom(pin);
      if (success) {
        navigation.navigate('WaitingRoom', { pin });
      }
    } catch (error) {
      setError('Failed to join room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = (text: string) => {
    // Only allow numbers and max 4 digits
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(numericText);
    if (error) {
      setError(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center mb-12">
          <Ionicons name="enter-outline" size={80} color="#ef4444" />
          <Text className="text-3xl font-bold text-white mt-4">
            Join Room
          </Text>
          <Text className="text-gray-400 text-center mt-2 text-lg">
            Enter the 4-digit PIN to join a game
          </Text>
        </View>

        <View className="w-full mb-8">
          <Text className="text-gray-400 text-sm mb-2">ROOM PIN</Text>
          <TextInput
            value={pin}
            onChangeText={handlePinChange}
            placeholder="Enter 4-digit PIN"
            placeholderTextColor="#6b7280"
            className="bg-gray-800 text-white text-2xl font-bold text-center rounded-lg py-6 px-4 tracking-widest"
            keyboardType="numeric"
            maxLength={4}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleJoinRoom}
          />
          {error && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
              <Text className="text-red-500 text-sm ml-2">{error}</Text>
            </View>
          )}
        </View>

        <View className="w-full space-y-4">
          <Pressable
            onPress={handleJoinRoom}
            disabled={isLoading || pin.length !== 4}
            className={`rounded-lg py-4 px-6 flex-row items-center justify-center space-x-3 ${
              isLoading || pin.length !== 4 ? 'bg-gray-600' : 'bg-red-600'
            }`}
          >
            <Ionicons 
              name={isLoading ? "hourglass-outline" : "checkmark-circle-outline"} 
              size={24} 
              color="white" 
            />
            <Text className="text-white font-semibold text-lg">
              {isLoading ? 'Joining...' : 'Join Room'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-gray-700 rounded-lg py-4 px-6 flex-row items-center justify-center space-x-3"
          >
            <Ionicons name="arrow-back-outline" size={24} color="white" />
            <Text className="text-white font-semibold text-lg">
              Back to Home
            </Text>
          </Pressable>
        </View>

        <View className="mt-8 px-4">
          <Text className="text-gray-400 text-center text-sm leading-5">
            Get the PIN from your friend who created the room
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}