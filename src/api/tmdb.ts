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
  // Pick 30 unique random page numbers from 1 to 60
  const pageNumbers = Array.from({ length: 60 }, (_, i) => i + 1);
  for (let i = pageNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pageNumbers[i], pageNumbers[j]] = [pageNumbers[j], pageNumbers[i]];
  }
  const selectedPages = pageNumbers.slice(0, 30);

  // Fetch the first movie from each selected page
  const movies: Movie[] = [];
  for (const page of selectedPages) {
    const res = await fetch(TMDB_API_URL + `&page=${page}`, {
      headers: {
        'Authorization': TMDB_AUTH_HEADER,
        'accept': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const m = data.results[0];
        movies.push({
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
        });
      }
    }
  }
  return movies;
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