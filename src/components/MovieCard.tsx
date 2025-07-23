import React, { useEffect, useState } from 'react';
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
import { fetchWatchProviders } from '../api/tmdb';

interface MovieCardProps {
  movie: Movie;
  onSwipe: (liked: boolean) => void;
  onTap?: () => void;
  isVisible: boolean;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = height * 0.52; // Use 52% of screen height to leave more room for buttons

export default function MovieCard({ movie, onSwipe, onTap, isVisible }: MovieCardProps) {
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



  const handleTap = () => {
    if (onTap) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTap();
    }
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
      
      // Check if this was a tap (minimal movement)
      const totalMovement = Math.abs(event.translationX) + Math.abs(event.translationY);
      const isTap = totalMovement < 10; // Less than 10px movement = tap

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
      } else if (isTap) {
        // This was a tap, not a swipe
        runOnJS(handleTap)();
      } else {
        // Spring back to center (partial swipe)
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

  const cardOverlayStyle = useAnimatedStyle(() => {
    const intensity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD * 0.3, SWIPE_THRESHOLD],
      [0, 0.2, 0.4], // More gradual and visible color intensity
      'clamp'
    );
    
    if (translateX.value > 20) {
      // Swiping right - green overlay
      return {
        opacity: intensity,
        backgroundColor: 'rgba(34, 197, 94, 1)' // Green
      };
    } else if (translateX.value < -20) {
      // Swiping left - red overlay  
      return {
        opacity: intensity,
        backgroundColor: 'rgba(239, 68, 68, 1)' // Red
      };
    }
    
    return {
      opacity: 0,
      backgroundColor: 'transparent'
    };
  });

  const [providers, setProviders] = useState<any>(null);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    setLoadingProviders(true);
    fetchWatchProviders(movie.id)
      .then((data) => {
        setProviders(data);
        setLoadingProviders(false);
      })
      .catch(() => {
        setProviders(null);
        setLoadingProviders(false);
      });
  }, [movie.id]);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View 
        className={cn(
          "absolute rounded-2xl overflow-hidden shadow-2xl",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        style={[{ width: CARD_WIDTH, height: CARD_HEIGHT }, animatedStyle]}
      >
        <View className="absolute inset-0 bg-gray-800 rounded-2xl" />
        <Animated.View 
          className="absolute inset-0 rounded-2xl"
          style={cardOverlayStyle} 
        />
        <View className="flex-1 bg-gray-800 rounded-2xl">
        {/* Movie Poster */}
        <View className="relative">
          <Image
            source={{ uri: movie.poster }}
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT * 0.5 }}
            contentFit="cover"
            contentPosition="center"
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
                  {movie.year} • {movie.duration === 0 ? 'I couldn’t find how long the movie is.' : `${movie.duration}min`}
            </Text>
          </View>
          <View className="flex-row flex-wrap mb-2">
            {movie.genre.slice(0, 3).map((genre, index) => (
              <View key={index} className="bg-gray-700 rounded-full px-2 py-1 mr-2 mb-1">
                <Text className="text-gray-300 text-xs">{genre}</Text>
              </View>
            ))}
          </View>
              {/* Watch Providers for Card */}
              <View className="mb-2">
                {loadingProviders ? (
                  <Text className="text-gray-400 text-xs">Loading providers...</Text>
                ) : providers ? (
                  providers.flatrate && providers.flatrate.length > 0 ? (
                    <View>
                      <Text className="text-gray-300 font-semibold mb-1 text-xs">Streaming</Text>
                      <View className="flex-row flex-wrap items-center">
                        {providers.flatrate.slice(0, 3).map((prov: any) => (
                          <View
                            key={prov.provider_id}
                            className="bg-blue-700 rounded-full px-3 py-1 mr-2 mb-1"
                            style={{ minHeight: 24, justifyContent: 'center' }}
                          >
                            <Text className="text-xs text-white" style={{ lineHeight: 16 }}>{prov.provider_name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : ((() => {
                    // Merge rent and buy providers into a single unique list
                    const rentProviders = providers.rent || [];
                    const buyProviders = providers.buy || [];
                    const allProviders = [...rentProviders, ...buyProviders];
                    const uniqueProviders = allProviders.filter((prov: any, idx: number, arr: any[]) => arr.findIndex(p => p.provider_id === prov.provider_id) === idx);
                    if (uniqueProviders.length > 0) {
                      return (
                        <View>
                          <Text className="text-gray-300 font-semibold mb-1 text-xs">Rent and Buy services:</Text>
                          <View className="flex-row flex-wrap items-center">
                            {uniqueProviders.slice(0, 3).map((prov: any) => (
                              <View
                                key={prov.provider_id}
                                className="bg-yellow-700 rounded-full px-3 py-1 mr-2 mb-1"
                                style={{ minHeight: 24, justifyContent: 'center' }}
                              >
                                <Text className="text-xs text-white" style={{ lineHeight: 16 }}>{prov.provider_name}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      );
                    }
                    return <Text className="text-gray-400 text-xs">I couldn’t find where to watch this movie.</Text>;
                  })())
                ) : (
                  <Text className="text-gray-400 text-xs">I couldn’t find where to watch this movie.</Text>
                )}
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