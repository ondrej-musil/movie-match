import React from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '../types/movie';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function MovieDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { movie } = route.params as { movie: Movie };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Pressable
          onPress={handleClose}
          className="bg-gray-800 rounded-full p-3"
        >
          <Ionicons name="close" size={24} color="white" />
        </Pressable>
        <Text className="text-white text-lg font-semibold">Movie Details</Text>
        <View className="w-12" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Movie Poster */}
        <View className="items-center px-6 mb-6">
          <Image
            source={{ uri: movie.poster }}
            style={{ width: width * 0.6, height: width * 0.9 }}
            contentFit="cover"
            contentPosition="top"
            className="rounded-2xl"
          />
        </View>

        {/* Movie Info */}
        <View className="px-6">
          {/* Title and Rating */}
          <View className="mb-4">
            <Text className="text-white text-3xl font-bold mb-2">
              {movie.title}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="star" size={20} color="#fbbf24" />
              <Text className="text-yellow-400 text-lg font-semibold ml-2">
                {movie.rating}
              </Text>
              <Text className="text-gray-400 text-lg ml-4">
                {movie.year} • {movie.duration}min
              </Text>
            </View>
          </View>

          {/* Genres */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">Genres</Text>
            <View className="flex-row flex-wrap">
              {movie.genre.map((genre, index) => (
                <View 
                  key={index} 
                  className="bg-gray-700 rounded-full px-4 py-2 mr-2 mb-2"
                >
                  <Text className="text-gray-300 text-sm">{genre}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Director */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-2">Director</Text>
            <Text className="text-gray-300 text-base">{movie.director}</Text>
          </View>

          {/* Cast */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-2">Cast</Text>
            <View className="flex-row flex-wrap">
              {movie.cast.map((actor, index) => (
                <View key={index} className="mr-4 mb-2">
                  <Text className="text-gray-300 text-base">{actor}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-3">Plot</Text>
            <Text className="text-gray-300 text-base leading-6">
              {movie.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Area */}
      <View className="px-6 py-4 bg-gray-800 bg-opacity-50">
        <Text className="text-gray-400 text-center text-sm">
          Close this screen to continue swiping
        </Text>
      </View>
    </SafeAreaView>
  );
}