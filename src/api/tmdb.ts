import { Movie } from '../types/movie';

const TMDB_API_URL = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';
const TMDB_AUTH_HEADER = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzMTI4MTc2ZGExYTQ2NmZiYjI1ZGNiOThkNWI0NWMwYiIsIm5iZiI6MTc1MTkzOTA4My42OTcsInN1YiI6IjY4NmM3ODBiZjNmZTNjZjVjYjZlODdiZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._HAWa9Vje2_RjSdsXNCsB1OyZC3m2HYGKgO97QnoCmc';

// Helper to map TMDB genre ids to names (minimal, for demo)
const GENRE_MAP: { [id: number]: string } = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

export async function fetchTMDBMovies(): Promise<Movie[]> {
  // Fetch page 1
  const res1 = await fetch(TMDB_API_URL + '&page=1', {
    headers: {
      'Authorization': TMDB_AUTH_HEADER,
      'accept': 'application/json',
    },
  });
  if (!res1.ok) throw new Error('Failed to fetch movies from TMDB (page 1)');
  const data1 = await res1.json();
  // Fetch page 2
  const res2 = await fetch(TMDB_API_URL + '&page=2', {
    headers: {
      'Authorization': TMDB_AUTH_HEADER,
      'accept': 'application/json',
    },
  });
  if (!res2.ok) throw new Error('Failed to fetch movies from TMDB (page 2)');
  const data2 = await res2.json();
  // Combine results and slice to 30
  const allResults = [...data1.results, ...data2.results].slice(0, 30);
  // Map TMDB movie objects to local Movie type
  return allResults.map((m: any) => ({
    id: m.id.toString(),
    title: m.title,
    year: m.release_date ? parseInt(m.release_date.slice(0, 4)) : 0,
    genre: (m.genre_ids || []).map((id: number) => GENRE_MAP[id] || 'Unknown'),
    rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : 0,
    description: m.overview || '',
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
    director: '', // Not available in discover endpoint
    cast: [],     // Not available in discover endpoint
    duration: 0,  // Not available in discover endpoint
  }));
} 

export async function fetchWatchProviders(movieId: number | string) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/watch/providers`,
    {
      headers: {
        Authorization: TMDB_AUTH_HEADER,
        accept: 'application/json',
      },
    }
  );
  if (!res.ok) throw new Error('Failed to fetch watch providers');
  const data = await res.json();
  // Prioritize US providers
  return data.results?.US || null;
} 