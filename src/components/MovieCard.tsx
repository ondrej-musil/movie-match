import React, { useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Movie } from '../types/movie';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../utils/cn';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface MovieCardProps {
  movie: Movie;
  onSwipe: (liked: boolean) => void;
  isVisible: boolean;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = height * 0.55; // Use 55% of screen height to leave more room for buttons

export default function MovieCard({ movie, onSwipe, isVisible }: MovieCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const SWIPE_THRESHOLD = width * 0.25;

  // Reset card position when movie changes
  useEffect(() => {
    translateX.value = withSpring(0, { damping: 20, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
    scale.value = withSpring(1, { damping: 20, stiffness: 150 });
  }, [movie.id]);

  const handleSwipeComplete = (liked: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSwipe(liked);
  };



  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.1; // Minimal vertical movement
      
      // Scale down slightly while dragging
      const distance = Math.abs(event.translationX);
      scale.value = interpolate(
        distance,
        [0, SWIPE_THRESHOLD],
        [1, 0.95],
        'clamp'
      );
    })
    .onEnd((event) => {
      const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD;
      const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD;

      if (shouldSwipeRight) {
        // Swipe right - Like
        translateX.value = withSpring(width * 1.5, { 
          damping: 15, 
          stiffness: 100 
        }, () => {
          runOnJS(handleSwipeComplete)(true);
        });
      } else if (shouldSwipeLeft) {
        // Swipe left - Pass
        translateX.value = withSpring(-width * 1.5, { 
          damping: 15, 
          stiffness: 100 
        }, () => {
          runOnJS(handleSwipeComplete)(false);
        });
      } else {
        // Spring back to center
        translateX.value = withSpring(0, { damping: 20, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
        scale.value = withSpring(1, { damping: 20, stiffness: 150 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width, width],
      [-30, 30],
      'clamp'
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotateZ: `${rotate}deg` }
      ],
    };
  });

  const likeOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      'clamp'
    ),
  }));

  const passOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      'clamp'
    ),
  }));

  const cardBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      [0.1, 0, 0.1], // Red tint when swiping left, green tint when swiping right
      'clamp'
    );
    
    return {
      backgroundColor: translateX.value < 0 
        ? `rgba(239, 68, 68, ${backgroundColor})` // Red tint
        : `rgba(34, 197, 94, ${backgroundColor})` // Green tint
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View 
        className={cn(
          "absolute rounded-2xl overflow-hidden shadow-2xl",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        style={[{ width: CARD_WIDTH, height: CARD_HEIGHT }, animatedStyle]}
      >
        <Animated.View 
          className="absolute inset-0 bg-gray-800 rounded-2xl"
          style={cardBackgroundStyle} 
        />
        <View className="flex-1 bg-gray-800 rounded-2xl">
        {/* Movie Poster */}
        <View className="relative">
          <Image
            source={{ uri: movie.poster }}
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT * 0.65 }}
            contentFit="cover"
            transition={300}
          />
          
          {/* Rating Badge */}
          <View className="absolute top-4 right-4 bg-yellow-500 rounded-full px-3 py-1 flex-row items-center">
            <Ionicons name="star" size={16} color="white" />
            <Text className="text-white font-bold ml-1">{movie.rating}</Text>
          </View>

          {/* Swipe Indicators */}
          <Animated.View 
            className="absolute inset-0 items-center justify-center"
            style={likeOpacityStyle}
          >
            <View className="bg-green-500 rounded-full p-4 rotate-12">
              <Ionicons name="heart" size={48} color="white" />
            </View>
          </Animated.View>

          <Animated.View 
            className="absolute inset-0 items-center justify-center"
            style={passOpacityStyle}
          >
            <View className="bg-red-500 rounded-full p-4 -rotate-12">
              <Ionicons name="close" size={48} color="white" />
            </View>
          </Animated.View>
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


        </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}