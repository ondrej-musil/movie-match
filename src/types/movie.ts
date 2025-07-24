export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string[];
  rating: number;
  description: string;
  poster: string;
  director: string;
  cast: string[];
  duration: number; // in minutes
}

export interface Room {
  id: string;
  pin: string;
  users: string[];
  movies: Movie[];
  matches: Match[];
  isActive: boolean;
  createdAt: Date;
  hostId: string;
  started?: boolean;
}

export interface Match {
  movieId: string;
  users: string[];
  matchedAt: Date;
}

export interface UserSwipe {
  userId: string;
  movieId: string;
  liked: boolean;
  swipedAt: Date;
}