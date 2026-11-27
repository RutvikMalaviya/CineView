import { notFound } from "next/navigation";
import { SeatBookingExperience } from "@/features/seat-selection/components/SeatBookingExperience";
import {
  cinemaService,
  movieService,
  seatService,
  showtimeService,
} from "@/services";

export default async function SeatSelectionPage({
  params,
}: {
  params: Promise<{ showtimeId: string }>;
}) {
  const { showtimeId } = await params;
  const [showtime, layout] = await Promise.all([
    showtimeService.getShowtimeById(showtimeId),
    seatService.getSeatLayout(showtimeId),
  ]);

  if (!showtime || !layout) {
    notFound();
  }

  const [movie, cinema] = await Promise.all([
    movieService.getMovieById(showtime.movieId),
    cinemaService.getCinemaById(showtime.cinemaId),
  ]);

  if (!movie || !cinema) {
    notFound();
  }

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
