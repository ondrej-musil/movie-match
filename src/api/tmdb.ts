import { Movie } from '../types/movie';

const TMDB_API_URL = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';
const TMDB_AUTH_HEADER = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzMTI4MTc2ZGExYTQ2NmZiYjI1ZGNiOThkNWI0NWMwYiIsIm5iZiI6MTc1MTkzOTA4My42OTcsInN1YiI6IjY4NmM3ODBiZjNmZTNjZjVjYjZlODdiZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._HAWa9Vje2_RjSdsXNCsB1OyZC3m2HYGKgO97QnoCmc';

// Helper to map TMDB genre ids to names (minimal, for demo)
export const GENRE_MAP: { [id: number]: string } = {
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

export async function fetchTMDBMovies(selectedGenres?: number[]): Promise<Movie[]> {
  // Pick 30 unique random page numbers from 1 to 120
  const pageNumbers = Array.from({ length: 120 }, (_, i) => i + 1);
  for (let i = pageNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pageNumbers[i], pageNumbers[j]] = [pageNumbers[j], pageNumbers[i]];
  }
  const selectedPages = pageNumbers.slice(0, 30); // 30 random pages

  let movies: Movie[] = [];
  const seenIds = new Set<string>();

  // Helper to create a Movie object
  function toMovie(m: any): Movie {
    return {
      id: m.id.toString(),
      title: m.title,
      year: m.release_date ? parseInt(m.release_date.slice(0, 4)) : 0,
      genre: (m.genre_ids || []).map((id: number) => GENRE_MAP[id] || 'Unknown'),
      rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : 0,
      description: m.overview || '',
      poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
      director: '',
      cast: [],
      duration: 0,
    };
  }

  // Helper to pick a random movie from a list that matches a filter
  function pickRandomMovie(results: any[], filterFn: (genreIds: number[], movie: any) => boolean): any | null {
    const filtered = results.filter(m => filterFn(m.genre_ids || [], m));
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  for (let i = 0; i < selectedPages.length && movies.length < 30; i++) {
    const page = selectedPages[i];
    const res = await fetch(TMDB_API_URL + `&page=${page}` , {
      headers: {
        'Authorization': TMDB_AUTH_HEADER,
        'accept': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        let picked = null;
        if (selectedGenres && selectedGenres.length > 0) {
          // 1. All genres
          picked = pickRandomMovie(data.results, (genreIds) => selectedGenres.every(id => genreIds.includes(id)));
          // 2. At least 2+ genres
          if (!picked && selectedGenres.length > 1) {
            picked = pickRandomMovie(data.results, (genreIds) => {
              const count = genreIds.filter(id => selectedGenres.includes(id)).length;
              return count >= 2;
            });
          }
          // 3. At least 1 genre
          if (!picked) {
            picked = pickRandomMovie(data.results, (genreIds) => genreIds.some(id => selectedGenres.includes(id)));
          }
        } else {
          // No genres selected, pick any
          picked = data.results[Math.floor(Math.random() * data.results.length)];
        }
        if (picked && !seenIds.has(picked.id.toString())) {
          movies.push(toMovie(picked));
          seenIds.add(picked.id.toString());
        }
      }
    }
  }
  return movies.slice(0, 30);
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

export async function fetchDirectorAndCast(movieId: number | string): Promise<{ director: string; cast: string[] }> {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
    headers: {
      Authorization: TMDB_AUTH_HEADER,
      accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch credits');
  const data = await res.json();
  // Find director
  const director = (data.crew || []).find((c: any) => c.job === 'Director')?.name || '';
  // Get top 5 cast
  const cast = (data.cast || []).slice(0, 5).map((c: any) => c.name);
  return { director, cast };
} 