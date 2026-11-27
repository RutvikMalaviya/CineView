import { DigitalTicketView } from "@/features/tickets/components/DigitalTicketView";

export default async function DigitalTicketPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  return <DigitalTicketView bookingId={bookingId} />;
}
