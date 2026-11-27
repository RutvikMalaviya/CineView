import { CinemaManagementView } from "@/features/admin/components/CinemaManagementView";
import { auditoriumService, cinemaService, movieService, showtimeService } from "@/services";

export default async function AdminPage() {
  const [cinemas, showtimes, movies] = await Promise.all([
    cinemaService.getCinemas(),
    showtimeService.getShowtimes(),
    movieService.getAllMovies(),
  ]);

  const auditoriumLists = await Promise.all(
    cinemas.map((c) => auditoriumService.getAuditoriumsByCinema(c.id)),
  );
  const auditoriums = auditoriumLists.flat();

  return (
    <CinemaManagementView
      cinemas={cinemas}
      auditoriums={auditoriums}
      initialShowtimes={showtimes}
      movies={movies}
    />
  );
}
