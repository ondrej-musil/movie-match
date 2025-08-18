import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useMovieMatchStore } from '../state/movieMatchStore';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '../types/movie';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ResultsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { currentRoom, getMatches } = useMovieMatchStore();
  const matches = getMatches();

  const getMatchedMovies = () => {
    if (!currentRoom) return [];
    return matches.map(match => {
      const movie = currentRoom.movies.find(m => m.id === match.movieId);
      return movie ? { ...match, movie } : null;
    }).filter(Boolean) as (typeof matches[0] & { movie: Movie })[];
  };

  const matchedMovies = getMatchedMovies();

  const handleMovieDetail = (movie: Movie) => {
    navigation.navigate('MovieDetail', { movie });
  };

  const handleGoHome = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="text-white text-2xl font-bold">Results</Text>
        <Pressable
          onPress={handleGoHome}
          className="bg-red-600 rounded-lg py-2 px-4 flex-row items-center justify-center"
        >
          <Ionicons name="home" size={20} color="white" />
          <Text className="text-white font-semibold text-lg ml-2">Go Back Home</Text>
        </Pressable>
      </View>
      <FlatList
        data={matchedMovies}
        keyExtractor={item => item.movieId}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleMovieDetail(item.movie)}
            className="flex-row items-center mb-6 bg-gray-800 rounded-xl p-4"
          >
            <Image
              source={{ uri: item.movie.poster }}
              style={{ width: 80, height: 120, borderRadius: 12, marginRight: 16 }}
            />
            <View style={{ flex: 1 }}>
              <Text className="text-white text-lg font-bold mb-1">{item.movie.title}</Text>
              <Text className="text-gray-400 text-sm mb-1">{item.movie.year}</Text>
              <Text className="text-gray-300 text-xs" numberOfLines={3}>{item.movie.description}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text className="text-gray-400 text-center mt-12">No matches yet.</Text>}
      />
    </SafeAreaView>
  );
} 