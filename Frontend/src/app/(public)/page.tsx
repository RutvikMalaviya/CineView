import { HomeDiscovery } from "@/features/movies/components/HomeDiscovery";
import { cinemaService, movieService } from "@/services";

export default async function HomePage() {
  const [movies, cinemas] = await Promise.all([
    movieService.getAllMovies(),
    cinemaService.getCinemas(),
  ]);

  return <HomeDiscovery movies={movies} cinemas={cinemas} />;
}
