import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 justify-center items-center px-6">
        {/* App Title */}
        <View className="items-center mb-12">
          <Ionicons name="film-outline" size={80} color="#ef4444" />
          <Text className="text-4xl font-bold text-white mt-4">
            Movie Match
          </Text>
          <Text className="text-gray-400 text-center mt-2 text-lg">
            Swipe movies with friends and find your perfect match!
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-4">
          <Pressable
            onPress={() => navigation.navigate('CreateRoom')}
            className="bg-red-600 rounded-lg py-4 px-6 flex-row items-center justify-center space-x-3"
          >
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text className="text-white font-semibold text-lg">
              Start New Game
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('JoinRoom')}
            className="bg-gray-700 rounded-lg py-4 px-6 flex-row items-center justify-center space-x-3"
          >
            <Ionicons name="enter-outline" size={24} color="white" />
            <Text className="text-white font-semibold text-lg">
              Join Game
            </Text>
          </Pressable>
        </View>

        {/* How it works */}
        <View className="mt-12 px-4">
          <Text className="text-gray-400 text-center text-sm leading-5">
            Create a room to get a 4-digit PIN, share it with friends, and start swiping on movies together!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}