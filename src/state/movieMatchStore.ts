import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, Room, Match, UserSwipe } from '../types/movie';
import { fetchTMDBMovies } from '../api/tmdb';
import { db } from '../api/firebase';
import { doc, setDoc, serverTimestamp, getDoc, updateDoc, arrayUnion, onSnapshot, Unsubscribe, collection, addDoc, onSnapshot as onColSnapshot, query, where, getDocs } from 'firebase/firestore';

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
  createRoom: () => Promise<string>;
  joinRoom: (pin: string) => Promise<boolean>;
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

let roomUnsubscribe: Unsubscribe | null = null;
let swipesUnsubscribe: Unsubscribe | null = null;

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

      createRoom: async () => {
        const pin = generatePin();
        const { userId } = get();
        let movies = [];
        try {
          movies = await fetchTMDBMovies();
        } catch (e) {
          // fallback to mockMovies if TMDB fetch fails
          const { mockMovies } = await import('../data/mockMovies');
          movies = mockMovies;
        }
        const newRoom: Room = {
          id: 'room_' + Date.now(),
          pin,
          users: [userId],
          hostId: userId,
          movies,
          matches: [],
          isActive: true,
          createdAt: new Date(),
          started: false,
        } as any;
        // Store in Firestore
        await setDoc(doc(db, 'rooms', pin), {
          ...newRoom,
          createdAt: serverTimestamp(),
          started: false,
          hostId: userId,
        });
        set({ 
          currentRoom: newRoom, 
          currentMovieIndex: 0,
          userSwipes: [],
          error: null 
        });
        return pin;
      },

      joinRoom: async (pin: string) => {
        const { userId } = get();
        if (pin.length === 4 && /^\d+$/.test(pin)) {
          // Try to fetch room from Firestore
          const roomRef = doc(db, 'rooms', pin);
          const roomSnap = await getDoc(roomRef);
          if (roomSnap.exists()) {
            const roomData = roomSnap.data();
            // Add user to users array in Firestore if not already present
            if (!roomData.users.includes(userId)) {
              await updateDoc(roomRef, {
                users: arrayUnion(userId)
              });
              roomData.users.push(userId);
            }
            // Set up real-time listener for room
            if (roomUnsubscribe) roomUnsubscribe();
            roomUnsubscribe = onSnapshot(roomRef, (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                set({
                  currentRoom: {
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                  },
                  error: null
                });
              }
            });
            // Set up real-time listener for swipes
            if (swipesUnsubscribe) swipesUnsubscribe();
            const swipesRef = collection(db, 'rooms', pin, 'swipes');
            swipesUnsubscribe = onColSnapshot(swipesRef, async (snapshot) => {
              const allSwipes = snapshot.docs.map(doc => doc.data());
              set({ userSwipes: allSwipes.filter((s: any) => s.userId === userId) });
              // Calculate matches: movies liked by all users
              const userIds = roomData.users;
              const movieLikes: Record<string, Set<string>> = {};
              allSwipes.forEach((swipe: any) => {
                if (swipe.liked) {
                  if (!movieLikes[swipe.movieId]) movieLikes[swipe.movieId] = new Set();
                  movieLikes[swipe.movieId].add(swipe.userId);
                }
              });
              const matches = Object.entries(movieLikes)
                .filter(([_, users]) => users.size === userIds.length)
                .map(([movieId, users]) => ({
                  movieId,
                  users: Array.from(users),
                  matchedAt: new Date(),
                }));
              // Update matches in Firestore if changed
              await updateDoc(roomRef, { matches });
            });
            set({
              currentRoom: {
                ...roomData,
                createdAt: roomData.createdAt?.toDate ? roomData.createdAt.toDate() : new Date(),
              },
              currentMovieIndex: 0,
              userSwipes: [],
              error: null
            });
            return true;
          }
          // fallback to mock if not found
          const { mockMovies } = await import('../data/mockMovies');
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
        if (roomUnsubscribe) {
          roomUnsubscribe();
          roomUnsubscribe = null;
        }
        if (swipesUnsubscribe) {
          swipesUnsubscribe();
          swipesUnsubscribe = null;
        }
        set({ 
          currentRoom: null, 
          currentMovieIndex: 0,
          userSwipes: [],
          error: null 
        });
      },

      swipeMovie: async (movieId: string, liked: boolean) => {
        const { userId, currentRoom } = get();
        if (!currentRoom) return;
        const swipe = {
          userId,
          movieId,
          liked,
          swipedAt: new Date(),
        };
        // Write swipe to Firestore
        const swipesRef = collection(db, 'rooms', currentRoom.pin, 'swipes');
        await addDoc(swipesRef, swipe);
        // Local state will update via real-time listener
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