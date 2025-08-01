import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useMovieMatchStore } from '../state/movieMatchStore';
import { Ionicons } from '@expo/vector-icons';
import MovieCard from '../components/MovieCard';
import * as Haptics from 'expo-haptics';

type SwipeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Swipe'>;

const { width } = Dimensions.get('window');

export default function SwipeScreen() {
  const navigation = useNavigation<SwipeScreenNavigationProp>();
  const { 
    currentRoom, 
    currentMovieIndex, 
    swipeMovie, 
    nextMovie, 
    leaveRoom, 
    getMatches,
    getSwipeStats,
    userSwipes 
  } = useMovieMatchStore();
  
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [lastMatchedMovie, setLastMatchedMovie] = useState<string | null>(null);

  const currentMovie = currentRoom?.movies[currentMovieIndex];
  const isLastMovie = currentRoom && currentMovieIndex >= currentRoom.movies.length - 1;
  const matches = getMatches();
  const swipeStats = getSwipeStats();

  // Track previous matches to show notification for new ones
  const prevMatchesRef = useRef<any[]>([]);
  const [newMatchTitle, setNewMatchTitle] = useState<string | null>(null);

  useEffect(() => {
    const prevMatches = prevMatchesRef.current;
    const prevIds = new Set(prevMatches.map(m => m.movieId));
    const newMatches = matches.filter(m => !prevIds.has(m.movieId));
    if (newMatches.length > 0) {
      // Show notification for each new match (show the first one)
      setNewMatchTitle(() => {
        const movie = currentRoom?.movies.find(m => m.id === newMatches[0].movieId);
        return movie ? movie.title : 'New Match!';
      });
      setShowMatchNotification(true);
      setTimeout(() => setShowMatchNotification(false), 3000);
    }
    prevMatchesRef.current = matches;
  }, [matches, currentRoom]);

  // Set header title to Room pin (the room pin)
  useEffect(() => {
    if (currentRoom?.pin) {
      navigation.setOptions({ title: `Room pin: ${currentRoom.pin}` });
    }
  }, [currentRoom?.pin, navigation]);

  const handleSwipe = (liked: boolean) => {
    if (!currentMovie) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeMovie(currentMovie.id, liked);
    
    if (isLastMovie) {
      // Wait for animation, then navigate to Results
      setTimeout(() => {
        navigation.navigate('Results');
      }, 300);
    } else {
      setTimeout(() => {
        nextMovie();
      }, 300);
    }
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Back to Main Menu',
      'Are you sure you want to leave this room and return to the main menu?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave Room', style: 'destructive', onPress: leaveRoom }
      ]
    );
  };

  const handleViewMatches = () => {
    navigation.navigate('Matches');
  };

  const handleMovieDetail = () => {
    if (currentMovie) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate('MovieDetail', { movie: currentMovie });
    }
  };

  if (!currentRoom) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white text-xl">No active room</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <View className="flex-row items-center space-x-4">
          {/* Player indicator moved to the leftmost position */}
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={24} color="#9ca3af" />
            <Text className="text-gray-400 ml-2">{currentRoom.users.length} players</Text>
          </View>
        </View>
        <View className="flex-row items-center space-x-4">
          <Pressable
            onPress={handleViewMatches}
            className="bg-green-600 rounded-full px-4 py-2 flex-row items-center space-x-2"
          >
            <Ionicons name="heart" size={16} color="white" />
            <Text className="text-white font-medium">{matches.length}</Text>
          </Pressable>
        </View>
      </View>
      {/* Progress Bar */}
      <View className="px-6 mb-4">
        <View className="bg-gray-700 rounded-full h-2">
          <View 
            className="bg-red-600 rounded-full h-2 transition-all duration-300"
            style={{ 
              width: `${((currentMovieIndex + 1) / currentRoom.movies.length) * 100}%` 
            }}
          />
        </View>
        <Text className="text-gray-400 text-sm mt-2 text-center">
          {currentMovieIndex + 1} of {currentRoom.movies.length}
        </Text>
      </View>

      {/* Movie Cards */}
      <View className="flex-1 items-center justify-start px-5 pt-2 pb-4">
        {currentMovie ? (
          <MovieCard
            key={currentMovie.id}
            movie={currentMovie}
            onSwipe={handleSwipe}
            onTap={handleMovieDetail}
            isVisible={true}
          />
        ) : (
          <View className="items-center">
            <Ionicons name="checkmark-circle-outline" size={80} color="#10b981" />
            <Text className="text-white text-2xl font-bold mt-4">
              All Done!
            </Text>
            <Text className="text-gray-400 text-center mt-2 px-4">
              You've swiped through all movies. Check your matches!
            </Text>
            
            {/* Swipe Stats */}
            <View className="bg-gray-800 rounded-xl p-4 mt-6 flex-row space-x-6">
              <View className="items-center">
                <Text className="text-green-400 text-2xl font-bold">{swipeStats.liked}</Text>
                <Text className="text-gray-400 text-sm">Liked</Text>
              </View>
              <View className="items-center">
                <Text className="text-red-400 text-2xl font-bold">{swipeStats.passed}</Text>
                <Text className="text-gray-400 text-sm">Passed</Text>
              </View>
              <View className="items-center">
                <Text className="text-blue-400 text-2xl font-bold">{matches.length}</Text>
                <Text className="text-gray-400 text-sm">Matches</Text>
              </View>
            </View>

            <Pressable
              onPress={handleViewMatches}
              className="bg-green-600 rounded-lg py-3 px-6 mt-6 flex-row items-center space-x-2"
            >
              <Ionicons name="heart" size={20} color="white" />
              <Text className="text-white font-semibold">View Matches</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Match Notification */}
      {showMatchNotification && (
        <View className="absolute top-20 left-4 right-4 bg-green-600 rounded-lg p-4 flex-row items-center space-x-3">
          <Ionicons name="heart" size={24} color="white" />
          <Text className="text-white font-semibold flex-1">
            {newMatchTitle ? `It's a match for "${newMatchTitle}"! 🎉` : `It's a match! 🎉`}
          </Text>
        </View>
      )}

      {/* Action Buttons and Instructions */}
      {currentMovie && (
        <View className="px-6 pb-6">
          <View className="flex-row justify-center items-center space-x-6 mb-3">
            <Pressable
              onPress={() => handleSwipe(false)}
              className="bg-red-600 rounded-full w-16 h-16 items-center justify-center"
            >
              <Ionicons name="close" size={32} color="white" />
            </Pressable>
            
            <Pressable
              onPress={handleMovieDetail}
              className="border-2 border-gray-400 rounded-full w-14 h-14 items-center justify-center"
            >
              <Ionicons name="information" size={24} color="#9ca3af" />
            </Pressable>
            
            <Pressable
              onPress={() => handleSwipe(true)}
              className="bg-green-600 rounded-full w-16 h-16 items-center justify-center"
            >
              <Ionicons name="heart" size={32} color="white" />
            </Pressable>
          </View>
          
          <View className="flex-row items-center justify-center space-x-6">
            <View className="flex-row items-center">
              <Text className="text-red-400 text-lg mr-2">←</Text>
              <Text className="text-gray-400 text-sm">Swipe left to pass</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-400 text-sm">Swipe right to like</Text>
              <Text className="text-green-400 text-lg ml-2">→</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}