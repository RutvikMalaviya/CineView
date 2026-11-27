import { MoviesCatalog } from "@/features/movies/components/MoviesCatalog";
import { movieService } from "@/services";

export default async function MoviesPage() {
  const movies = await movieService.getAllMovies();
  return <MoviesCatalog movies={movies} />;
}
