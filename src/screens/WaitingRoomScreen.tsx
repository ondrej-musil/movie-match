import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

// Define the route prop type for this screen
 type WaitingRoomScreenRouteProp = RouteProp<RootStackParamList, 'WaitingRoom'>;
 type WaitingRoomScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WaitingRoom'>;

export default function WaitingRoomScreen() {
  const route = useRoute<WaitingRoomScreenRouteProp>();
  const navigation = useNavigation<WaitingRoomScreenNavigationProp>();
  const { pin } = route.params;

  const handleStartGame = () => {
    navigation.navigate('Swipe');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center px-6">
      <View className="items-center mb-12">
        <Text className="text-3xl font-bold text-white mt-4">Waiting Room</Text>
        <Text className="text-gray-400 text-center mt-2 text-lg">
          Share this PIN with your friends to join the room
        </Text>
      </View>
      <View className="bg-gray-800 rounded-2xl p-8 mb-8 items-center">
        <Text className="text-gray-400 text-sm mb-2">ROOM PIN</Text>
        <Text className="text-6xl font-bold text-white tracking-widest">{pin}</Text>
      </View>
      <Text className="text-gray-400 text-lg mb-8">Waiting for others to join...</Text>
      <Pressable
        onPress={handleStartGame}
        className="bg-red-600 rounded-lg py-4 px-8 flex-row items-center justify-center"
      >
        <Text className="text-white font-semibold text-lg">Start the Game</Text>
      </Pressable>
    </SafeAreaView>
  );
} 