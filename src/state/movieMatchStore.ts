import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, Room, Match, UserSwipe } from '../types/movie';
import { mockMovies } from '../data/mockMovies';

interface MovieMatchState {
  // Current user
  userId: string;
  
  // Room state
  currentRoom: Room | null;
  
  // Swipe state
  currentMovieIndex: number;
  userSwipes: UserSwipe[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUserId: (id: string) => void;
  createRoom: () => string;
  joinRoom: (pin: string) => boolean;
  leaveRoom: () => void;
  swipeMovie: (movieId: string, liked: boolean) => void;
  nextMovie: () => void;
  resetSwipes: () => void;
  getMatches: () => Match[];
  getLikedMovies: () => UserSwipe[];
  getSwipeStats: () => { total: number; liked: number; passed: number };
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// Generate a random 4-digit PIN
const generatePin = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Generate a random user ID
const generateUserId = (): string => {
  return 'user_' + Math.random().toString(36).substr(2, 9);
};

export const useMovieMatchStore = create<MovieMatchState>()(
  persist(
    (set, get) => ({
      userId: generateUserId(),
      currentRoom: null,
      currentMovieIndex: 0,
      userSwipes: [],
      isLoading: false,
      error: null,

      setUserId: (id: string) => set({ userId: id }),

      createRoom: () => {
        const pin = generatePin();
        const { userId } = get();
        const newRoom: Room = {
          id: 'room_' + Date.now(),
          pin,
          users: [userId],
          movies: [...mockMovies],
          matches: [],
          isActive: true,
          createdAt: new Date(),
        };
        
        set({ 
          currentRoom: newRoom, 
          currentMovieIndex: 0,
          userSwipes: [],
          error: null 
        });
        return pin;
      },

      joinRoom: (pin: string) => {
        // Mock room joining - in real app this would call backend
        const { userId } = get();
        
        // Simulate finding a room with this PIN
        if (pin.length === 4 && /^\d+$/.test(pin)) {
          const mockRoom: Room = {
            id: 'room_' + pin,
            pin,
            users: [userId, 'other_user_' + Math.random().toString(36).substr(2, 5)],
            movies: [...mockMovies],
            matches: [],
            isActive: true,
            createdAt: new Date(),
          };
          
          set({ 
            currentRoom: mockRoom, 
            currentMovieIndex: 0,
            userSwipes: [],
            error: null 
          });
          return true;
        }
        
        set({ error: 'Invalid PIN. Please enter a 4-digit PIN.' });
        return false;
      },

      leaveRoom: () => {
        set({ 
          currentRoom: null, 
          currentMovieIndex: 0,
          userSwipes: [],
          error: null 
        });
      },

      swipeMovie: (movieId: string, liked: boolean) => {
        const { userId, userSwipes, currentRoom } = get();
        
        const newSwipe: UserSwipe = {
          userId,
          movieId,
          liked,
          swipedAt: new Date(),
        };
        
        const updatedSwipes = [...userSwipes, newSwipe];
        
        // Check for matches (mock logic - in real app this would sync with backend)
        if (currentRoom && liked) {
          // Simulate other users' swipes for demo
          const otherUsersLiked = Math.random() > 0.5; // 50% chance of match
          
          if (otherUsersLiked) {
            const newMatch: Match = {
              movieId,
              users: currentRoom.users,
              matchedAt: new Date(),
            };
            
            const updatedRoom = {
              ...currentRoom,
              matches: [...currentRoom.matches, newMatch],
            };
            
            set({ 
              userSwipes: updatedSwipes,
              currentRoom: updatedRoom,
            });
          } else {
            set({ userSwipes: updatedSwipes });
          }
        } else {
          set({ userSwipes: updatedSwipes });
        }
      },

      nextMovie: () => {
        const { currentMovieIndex, currentRoom } = get();
        if (currentRoom && currentMovieIndex < currentRoom.movies.length - 1) {
          set({ currentMovieIndex: currentMovieIndex + 1 });
        }
      },

      resetSwipes: () => {
        set({ currentMovieIndex: 0, userSwipes: [] });
      },

      getMatches: () => {
        const { currentRoom } = get();
        return currentRoom?.matches || [];
      },

      getLikedMovies: () => {
        const { userSwipes } = get();
        return userSwipes.filter(swipe => swipe.liked);
      },

      getSwipeStats: () => {
        const { userSwipes } = get();
        const total = userSwipes.length;
        const liked = userSwipes.filter(swipe => swipe.liked).length;
        const passed = total - liked;
        return { total, liked, passed };
      },

      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'movie-match-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        userId: state.userId,
        userSwipes: state.userSwipes,
        currentRoom: state.currentRoom,
        currentMovieIndex: state.currentMovieIndex,
      }),
    }
  )
);