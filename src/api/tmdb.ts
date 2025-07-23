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
  // Pick 30 unique random page numbers from 1 to 100
  const pageNumbers = Array.from({ length: 100 }, (_, i) => i + 1);
  for (let i = pageNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pageNumbers[i], pageNumbers[j]] = [pageNumbers[j], pageNumbers[i]];
  }
  const selectedPages = pageNumbers.slice(0, 100); // up to 100 pages for more variety if needed

  function buildGenreQuery(genres: number[] | undefined, mode: 'any' | 'all' | 'atleast2') {
    if (!genres || genres.length === 0) return '';
    if (mode === 'any') {
      return `&with_genres=${genres.join(',')}`;
    } else if (mode === 'all') {
      return `&with_genres=${genres.join(',')}&with_genres_mode=AND`;
    } else if (mode === 'atleast2') {
      return `&with_genres=${genres.join(',')}`;
    }
    return '';
  }

  let movies: Movie[] = [];
  const seenIds = new Set<string>();
  let pageIndex = 0;

  // Helper to add unique movies with strict genre filtering
  function addUniqueMoviesStrict(results: any[], filterFn: (genreIds: number[], movie: any) => boolean) {
    for (const m of results) {
      // Debug log: print selectedGenres, movie genre_ids, and mapped names
      if (selectedGenres && selectedGenres.length > 0) {
        console.log('[GENRE DEBUG]', {
          selectedGenres,
          movieId: m.id,
          movieTitle: m.title,
          movieGenreIds: m.genre_ids,
          movieGenreNames: (m.genre_ids || []).map((id: number) => GENRE_MAP[id] || 'Unknown'),
        });
      }
      if (!seenIds.has(m.id.toString()) && filterFn(m.genre_ids || [], m)) {
        movies.push({
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
        });
        seenIds.add(m.id.toString());
        if (movies.length >= 30) break;
      }
    }
  }

  // No genres selected: fetch as before, but ensure 30 movies
  if (!selectedGenres || selectedGenres.length === 0) {
    while (movies.length < 30 && pageIndex < selectedPages.length) {
      const page = selectedPages[pageIndex++];
      const res = await fetch(TMDB_API_URL + `&page=${page}` , {
        headers: {
          'Authorization': TMDB_AUTH_HEADER,
          'accept': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          addUniqueMoviesStrict(data.results, () => true);
        }
      }
    }
    return movies.slice(0, 30);
  }

  // One genre: only include movies that have that genre (can have others too)
  if (selectedGenres.length === 1) {
    const genreId = selectedGenres[0];
    while (movies.length < 30 && pageIndex < selectedPages.length) {
      const page = selectedPages[pageIndex++];
      const res = await fetch(TMDB_API_URL + `&page=${page}` + buildGenreQuery([genreId], 'any'), {
        headers: {
          'Authorization': TMDB_AUTH_HEADER,
          'accept': 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          addUniqueMoviesStrict(data.results, (genreIds) => genreIds.includes(genreId));
        }
      }
    }
    return movies.slice(0, 30);
  }

  // 2+ genres: fetch a mix
  // 1. Movies with only one of the genres
  for (const genreId of selectedGenres) {
    if (movies.length >= 30) break;
    const res = await fetch(TMDB_API_URL + `&page=${Math.floor(Math.random() * 100) + 1}` + buildGenreQuery([genreId], 'any'), {
      headers: {
        'Authorization': TMDB_AUTH_HEADER,
        'accept': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        addUniqueMoviesStrict(data.results, (genreIds) => genreIds.includes(genreId));
      }
    }
  }
  // 2. Movies that contain all of the genres
  for (let i = 0; i < Math.min(20, selectedPages.length); i++) {
    if (movies.length >= 30) break;
    const page = selectedPages[i];
    const res = await fetch(TMDB_API_URL + `&page=${page}` + buildGenreQuery(selectedGenres, 'all'), {
      headers: {
        'Authorization': TMDB_AUTH_HEADER,
        'accept': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        addUniqueMoviesStrict(data.results, (genreIds) => selectedGenres.every((id) => genreIds.includes(id)));
      }
    }
  }
  // 3. Movies that contain at least two of the genres (fetch with any, filter client-side)
  for (let i = 0; i < Math.min(20, selectedPages.length); i++) {
    if (movies.length >= 30) break;
    const page = selectedPages[i];
    const res = await fetch(TMDB_API_URL + `&page=${page}` + buildGenreQuery(selectedGenres, 'atleast2'), {
      headers: {
        'Authorization': TMDB_AUTH_HEADER,
        'accept': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        addUniqueMoviesStrict(data.results, (genreIds) => {
          const count = genreIds.filter((id) => selectedGenres.includes(id)).length;
          return count >= 2;
        });
      }
    }
  }
  // If still not enough, keep fetching with any until 30, but strictly filter
  pageIndex = 0;
  while (movies.length < 30 && pageIndex < selectedPages.length) {
    const page = selectedPages[pageIndex++];
    const res = await fetch(TMDB_API_URL + `&page=${page}` + buildGenreQuery(selectedGenres, 'any'), {
      headers: {
        'Authorization': TMDB_AUTH_HEADER,
        'accept': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        addUniqueMoviesStrict(data.results, (genreIds) => {
          // Accept if at least one of the selected genres is present
          return genreIds.some((id) => selectedGenres.includes(id));
        });
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