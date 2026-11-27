import { ShowtimeSelectorView } from "@/features/showtimes/components/ShowtimeSelectorView";
import { cinemaService, movieService, showtimeService } from "@/services";

export default async function ShowtimesPage() {
  const [movies, cinemas, showtimes] = await Promise.all([
    movieService.getAllMovies(),
    cinemaService.getCinemas(),
    showtimeService.getShowtimes(),
  ]);

  return <ShowtimeSelectorView movies={movies} cinemas={cinemas} showtimes={showtimes} />;
}
