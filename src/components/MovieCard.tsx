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

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = height * 0.65; // Use 65% of screen height to leave room for buttons

export default function MovieCard({ movie, onSwipe, isVisible }: MovieCardProps) {
  return (
    <View 
      className={cn(
        "absolute bg-gray-800 rounded-2xl overflow-hidden shadow-2xl",
        isVisible ? "opacity-100" : "opacity-0"
      )}
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
    >
      {/* Movie Poster */}
      <View className="relative">
        <Image
          source={{ uri: movie.poster }}
          style={{ width: CARD_WIDTH, height: CARD_HEIGHT * 0.6 }}
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
      <View className="p-4 flex-1 justify-between">
        <View>
          <Text className="text-white text-xl font-bold mb-2 numberOfLines={1}">
            {movie.title}
          </Text>
          
          <View className="flex-row items-center mb-2">
            <Text className="text-gray-400 text-sm">
              {movie.year} • {movie.duration}min
            </Text>
          </View>

          <View className="flex-row flex-wrap mb-2">
            {movie.genre.slice(0, 3).map((genre, index) => (
              <View key={index} className="bg-gray-700 rounded-full px-2 py-1 mr-2 mb-1">
                <Text className="text-gray-300 text-xs">{genre}</Text>
              </View>
            ))}
          </View>

          <Text className="text-gray-300 text-xs numberOfLines={2}">
            {movie.description}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-8 mt-4">
          <Pressable
            onPress={() => onSwipe(false)}
            className="bg-red-600 rounded-full w-14 h-14 items-center justify-center"
          >
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
          
          <Pressable
            onPress={() => onSwipe(true)}
            className="bg-green-600 rounded-full w-14 h-14 items-center justify-center"
          >
            <Ionicons name="heart" size={28} color="white" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}