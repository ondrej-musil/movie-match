import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMovieMatchStore } from '../state/movieMatchStore';
import { Movie } from '../types/movie';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import CreateRoomScreen from '../screens/CreateRoomScreen';
import JoinRoomScreen from '../screens/JoinRoomScreen';
import WaitingRoomScreen from '../screens/WaitingRoomScreen';
import SwipeScreen from '../screens/SwipeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import MovieDetailScreen from '../screens/MovieDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  CreateRoom: undefined;
  JoinRoom: undefined;
  WaitingRoom: { pin: string };
  Swipe: undefined;
  Matches: undefined;
  MovieDetail: { movie: Movie };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  // const { currentRoom } = useMovieMatchStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1f2937',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Movie Match' }}
          />
          <Stack.Screen 
            name="CreateRoom" 
            component={CreateRoomScreen} 
            options={{ title: 'Create Room' }}
          />
          <Stack.Screen 
            name="JoinRoom" 
            component={JoinRoomScreen} 
            options={{ title: 'Join Room' }}
          />
      <Stack.Screen
        name="WaitingRoom"
        component={WaitingRoomScreen}
        options={{ title: 'Waiting Room' }}
      />
          <Stack.Screen 
            name="Swipe" 
            component={SwipeScreen} 
            options={{ 
          title: 'Swipe',
              headerLeft: () => null,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="Matches" 
            component={MatchesScreen} 
            options={{ title: 'Matches' }}
          />
          <Stack.Screen 
            name="MovieDetail" 
            component={MovieDetailScreen} 
            options={{ 
              title: 'Movie Details',
              presentation: 'modal',
              headerShown: false,
            }}
          />
    </Stack.Navigator>
  );
}