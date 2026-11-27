import { notFound } from "next/navigation";
import { CinemaDetailsView } from "@/features/cinemas/components/CinemaDetailsView";
import {
  auditoriumService,
  cinemaService,
  movieService,
  showtimeService,
} from "@/services";

export default async function CinemaDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cinema, auditoriums, showtimes, movies] = await Promise.all([
    cinemaService.getCinemaById(id),
    auditoriumService.getAuditoriumsByCinema(id),
    showtimeService.getShowtimes(undefined, id),
    movieService.getAllMovies(),
  ]);

  if (!cinema) {
    notFound();
  }

  return (
    <CinemaDetailsView
      cinema={cinema}
      auditoriums={auditoriums}
      showtimes={showtimes}
      movies={movies}
    />
  );
}
