import { notFound } from "next/navigation";
import { MovieDetailsView } from "@/features/movies/components/MovieDetailsView";
import { cinemaService, movieService, showtimeService } from "@/services";

export default async function MovieDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [movie, showtimes, cinemas] = await Promise.all([
    movieService.getMovieById(id),
    showtimeService.getShowtimes(id),
    cinemaService.getCinemas(),
  ]);

  if (!movie) {
    notFound();
  }

  return <MovieDetailsView movie={movie} showtimes={showtimes} cinemas={cinemas} />;
}
