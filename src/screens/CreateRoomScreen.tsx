import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useMovieMatchStore } from '../state/movieMatchStore';
import { Ionicons } from '@expo/vector-icons';
import { GENRE_MAP } from '../api/tmdb';

type CreateRoomScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateRoom'>;

export default function CreateRoomScreen() {
  const navigation = useNavigation<CreateRoomScreenNavigationProp>();
  const { createRoom } = useMovieMatchStore();
  const [roomPin, setRoomPin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  const handleCreateRoom = async () => {
    setIsLoading(true);
    try {
      const pin = await createRoom(selectedGenres);
      navigation.navigate('WaitingRoom', { pin });
    } catch (error) {
      Alert.alert('Error', 'Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleStartSwiping = () => {
    navigation.navigate('Swipe');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 justify-center items-center px-6">
        {!roomPin ? (
          <>
            <View className="items-center mb-12">
              <Ionicons name="add-circle-outline" size={80} color="#ef4444" />
              <Text className="text-3xl font-bold text-white mt-4">
                Create Room
              </Text>
              <Text className="text-gray-400 text-center mt-2 text-lg">
                Start a new movie matching session
              </Text>
            </View>

            {/* Genre Selection UI */}
            <View className="w-full mb-8">
              <Text className="text-white text-lg font-semibold mb-3 text-center">Select Genres (optional)</Text>
              <View className="flex-row flex-wrap justify-center">
                {Object.entries(GENRE_MAP).map(([id, name]) => (
                  <Pressable
                    key={id}
                    onPress={() => handleToggleGenre(Number(id))}
                    className={`px-4 py-2 rounded-full mr-2 mb-2 border-2 ${
                      selectedGenres.includes(Number(id))
                        ? 'bg-red-600 border-red-400'
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <Text className={`text-sm font-semibold ${selectedGenres.includes(Number(id)) ? 'text-white' : 'text-gray-300'}`}>{name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="w-full">
              <Pressable
                onPress={handleCreateRoom}
                disabled={isLoading}
                className={`rounded-lg py-4 px-6 flex-row items-center justify-center space-x-3 ${
                  isLoading ? 'bg-gray-600' : 'bg-red-600'
                }`}
              >
                <Ionicons 
                  name={isLoading ? "hourglass-outline" : "rocket-outline"} 
                  size={24} 
                  color="white" 
                />
                <Text className="text-white font-semibold text-lg">
                  {isLoading ? 'Creating...' : 'Create Room'}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View className="items-center mb-12">
              <Ionicons name="checkmark-circle-outline" size={80} color="#10b981" />
              <Text className="text-3xl font-bold text-white mt-4">
                Room Created!
              </Text>
              <Text className="text-gray-400 text-center mt-2 text-lg">
                Share this PIN with your friends
              </Text>
            </View>

            <View className="bg-gray-800 rounded-2xl p-8 mb-8 items-center">
              <Text className="text-gray-400 text-sm mb-2">ROOM PIN</Text>
              <Text className="text-6xl font-bold text-white tracking-widest">
                {roomPin}
              </Text>
            </View>

            <View className="w-full space-y-4">
              <Pressable
                onPress={handleStartSwiping}
                className="bg-red-600 rounded-lg py-4 px-6 flex-row items-center justify-center space-x-3"
              >
                <Ionicons name="play-circle-outline" size={24} color="white" />
                <Text className="text-white font-semibold text-lg">
                  Start Swiping
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
                Your friends can join using this PIN. Once everyone is ready, start swiping to find your movie matches!
              </Text>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}