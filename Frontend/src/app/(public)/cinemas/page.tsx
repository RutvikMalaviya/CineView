import { CinemaListView } from "@/features/cinemas/components/CinemaListView";
import { cinemaService, movieService, showtimeService } from "@/services";

export default async function CinemasPage() {
  const [cinemas, showtimes, movies] = await Promise.all([
    cinemaService.getCinemas(),
    showtimeService.getShowtimes(),
    movieService.getAllMovies(),
  ]);

  return <CinemaListView cinemas={cinemas} showtimes={showtimes} movies={movies} />;
}
