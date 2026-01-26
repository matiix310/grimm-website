import { events } from "#velite";
import { notFound, redirect } from "next/navigation";
import { parseUTCDate } from "@/lib/dates";

export default async function EventRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);

  if (!event) {
    return notFound();
  }

  const now = new Date();

  const hasActiveTickets =
    event.ticket_link &&
    event.ticket_opening_date &&
    event.ticket_closing_date &&
    now >= parseUTCDate(event.ticket_opening_date) &&
    now <= parseUTCDate(event.ticket_closing_date);

  if (hasActiveTickets) {
    return redirect(event.ticket_link!);
  }

  return redirect(`/events/${event.slug}`);
}
