import { notFound } from "next/navigation";
import { SeatBookingExperience } from "@/features/seat-selection/components/SeatBookingExperience";
import {
  cinemaService,
  movieService,
  seatService,
  showtimeService,
} from "@/services";

export default async function SeatViewDefaultPage() {
  const defaultId = "st-dune-imax-1915";
  const [showtime, layout] = await Promise.all([
    showtimeService.getShowtimeById(defaultId),
    seatService.getSeatLayout(defaultId),
  ]);

  if (!showtime || !layout) notFound();

  const [movie, cinema] = await Promise.all([
    movieService.getMovieById(showtime.movieId),
    cinemaService.getCinemaById(showtime.cinemaId),
  ]);

  if (!movie || !cinema) notFound();

  return (
    <SeatBookingExperience
      movie={movie}
      cinema={cinema}
      auditorium={layout.auditorium}
      showtime={showtime}
      seats={layout.seats}
    />
  );
}
