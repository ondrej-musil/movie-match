import React from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Movie } from '../types/movie';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../utils/cn';

interface MovieCardProps {
  movie: Movie;
  onSwipe: (liked: boolean) => void;
  isVisible: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export default function MovieCard({ movie, onSwipe, isVisible }: MovieCardProps) {
  return (
    <View 
      className={cn(
        "absolute bg-gray-800 rounded-2xl overflow-hidden shadow-2xl",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      style={{ width: CARD_WIDTH, height: 600 }}
    >
      {/* Movie Poster */}
      <View className="relative">
        <Image
          source={{ uri: movie.poster }}
          style={{ width: CARD_WIDTH, height: 350 }}
          contentFit="cover"
          transition={300}
        />
        
        {/* Rating Badge */}
        <View className="absolute top-4 right-4 bg-yellow-500 rounded-full px-3 py-1 flex-row items-center">
          <Ionicons name="star" size={16} color="white" />
          <Text className="text-white font-bold ml-1">{movie.rating}</Text>
        </View>
      </View>

      {/* Movie Details */}
      <View className="p-6 flex-1">
        <Text className="text-white text-2xl font-bold mb-2 numberOfLines={1}">
          {movie.title}
        </Text>
        
        <View className="flex-row items-center mb-3">
          <Text className="text-gray-400 text-base">
            {movie.year} • {movie.duration}min
          </Text>
        </View>

        <View className="flex-row flex-wrap mb-3">
          {movie.genre.slice(0, 3).map((genre, index) => (
            <View key={index} className="bg-gray-700 rounded-full px-3 py-1 mr-2 mb-2">
              <Text className="text-gray-300 text-sm">{genre}</Text>
            </View>
          ))}
        </View>

        <Text className="text-gray-300 text-sm flex-1 numberOfLines={3}">
          {movie.description}
        </Text>

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-8 mt-6">
          <Pressable
            onPress={() => onSwipe(false)}
            className="bg-red-600 rounded-full w-16 h-16 items-center justify-center"
          >
            <Ionicons name="close" size={32} color="white" />
          </Pressable>
          
          <Pressable
            onPress={() => onSwipe(true)}
            className="bg-green-600 rounded-full w-16 h-16 items-center justify-center"
          >
            <Ionicons name="heart" size={32} color="white" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}