import { BookingConfirmationView } from "@/features/booking/components/BookingConfirmationView";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <BookingConfirmationView bookingId={bookingId} />;
}
