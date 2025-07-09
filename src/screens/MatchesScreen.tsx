import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useMovieMatchStore } from '../state/movieMatchStore';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '../types/movie';

export default function MatchesScreen() {
  const navigation = useNavigation();
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

  const renderMatchItem = ({ item }: { item: typeof matchedMovies[0] }) => (
    <Pressable 
      onPress={() => handleMovieDetail(item.movie)}
      className="bg-gray-800 rounded-xl p-4 mb-4 flex-row"
    >
      <Image
        source={{ uri: item.movie.poster }}
        style={{ width: 80, height: 120 }}
        contentFit="cover"
        className="rounded-lg"
      />
      
      <View className="flex-1 ml-4">
        <Text className="text-white text-lg font-bold mb-1" numberOfLines={2}>
          {item.movie.title}
        </Text>
        
        <View className="flex-row items-center mb-2">
          <Ionicons name="star" size={16} color="#fbbf24" />
          <Text className="text-gray-400 ml-1">{item.movie.rating}</Text>
          <Text className="text-gray-400 ml-2">• {item.movie.year}</Text>
        </View>

        <View className="flex-row flex-wrap mb-2">
          {item.movie.genre.slice(0, 2).map((genre, index) => (
            <View key={index} className="bg-gray-700 rounded-full px-2 py-1 mr-1 mb-1">
              <Text className="text-gray-300 text-xs">{genre}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row items-center">
          <Ionicons name="people-outline" size={16} color="#10b981" />
          <Text className="text-green-400 ml-1 text-sm">
            {item.users.length} players matched
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <View className="flex-row items-center">
            <Ionicons name="heart" size={24} color="#ef4444" />
            <Text className="text-white text-xl font-bold ml-2">
              Your Matches
            </Text>
          </View>
          
          <Text className="text-gray-400">
            {matchedMovies.length} {matchedMovies.length === 1 ? 'match' : 'matches'}
          </Text>
        </View>

        {/* Matches List */}
        {matchedMovies.length > 0 ? (
          <FlatList
            data={matchedMovies}
            renderItem={renderMatchItem}
            keyExtractor={(item) => item.movieId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="heart-outline" size={80} color="#6b7280" />
            <Text className="text-white text-xl font-bold mt-4">
              No matches yet
            </Text>
            <Text className="text-gray-400 text-center mt-2 px-8">
              Keep swiping to find movies you and your friends both love!
            </Text>
            
            <Pressable
              onPress={() => navigation.goBack()}
              className="bg-red-600 rounded-lg py-3 px-6 mt-6 flex-row items-center space-x-2"
            >
              <Ionicons name="arrow-back-outline" size={20} color="white" />
              <Text className="text-white font-semibold">Back to Swiping</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}