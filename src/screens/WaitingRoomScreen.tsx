import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { db } from '../api/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useMovieMatchStore } from '../state/movieMatchStore';
import { Ionicons } from '@expo/vector-icons';
import { Share } from 'react-native';

// Define the route prop type for this screen
 type WaitingRoomScreenRouteProp = RouteProp<RootStackParamList, 'WaitingRoom'>;
 type WaitingRoomScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WaitingRoom'>;

export default function WaitingRoomScreen() {
  const route = useRoute<WaitingRoomScreenRouteProp>();
  const navigation = useNavigation<WaitingRoomScreenNavigationProp>();
  const { pin } = route.params;
  const userId = useMovieMatchStore(state => state.userId);
  const [started, setStarted] = useState(false);
  const [hostId, setHostId] = useState<string | null>(null);
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'rooms', pin), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStarted(!!data.started);
        setHostId(data.hostId || null);
        setUsers(data.users || []);
      }
    });
    return () => unsub();
  }, [pin]);

  const handleStartGame = async () => {
    await updateDoc(doc(db, 'rooms', pin), { started: true });
    navigation.navigate('Swipe');
  };

  useEffect(() => {
    if (started) {
      navigation.navigate('Swipe');
    }
  }, [started, navigation]);

  const isHost = userId === hostId;

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
        <Pressable
          onPress={async () => {
            await Share.share({
              message: `Join my Movie Matcher room! Use PIN: ${pin}`,
            });
          }}
          className="bg-blue-600 rounded-lg py-2 px-4 flex-row items-center justify-center mt-6"
        >
          <Ionicons name="share-outline" size={20} color="white" style={{ marginRight: 6 }} />
          <Text className="text-white font-semibold text-base">Share</Text>
        </Pressable>
      </View>
      <View className="flex-row items-center mb-2">
        <Ionicons name="person" size={22} color="#9CA3AF" style={{ marginRight: 6 }} />
        <Text className="text-gray-400 text-lg">
          {users.length} player{users.length === 1 ? '' : 's'}
        </Text>
      </View>
      {!started ? (
        <>
          <Text className="text-gray-400 text-lg mb-8">Waiting for host to start the game...</Text>
          {isHost && (
            <Pressable
              onPress={handleStartGame}
              className="bg-red-600 rounded-lg py-4 px-8 flex-row items-center justify-center"
            >
              <Text className="text-white font-semibold text-lg">Start the Game</Text>
            </Pressable>
          )}
        </>
      ) : null}
    </SafeAreaView>
  );
} 