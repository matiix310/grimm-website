import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { TicketIcon, MapPinIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { events } from "#velite";

type Event = (typeof events)[number];

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const isTicketAvailable =
    event.ticket_link &&
    event.ticket_opening_date &&
    event.ticket_closing_date &&
    new Date() >= new Date(event.ticket_opening_date) &&
    new Date() <= new Date(event.ticket_closing_date);

  const now = new Date();
  const startDate = new Date(event.starting_date);
  const endDate = event.ending_date ? new Date(event.ending_date) : startDate;

  let status: "upcoming" | "ongoing" | "finished" = "upcoming";
  if (now > endDate) {
    status = "finished";
  } else if (now >= startDate && now <= endDate) {
    status = "ongoing";
  }

  return (
    <Link href={`/events/${event.slug}`} className="group block h-full">
      <div
        className={cn(
          "bg-secondary text-secondary-foreground rounded-2xl overflow-hidden h-full flex flex-col transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg",
          status === "finished" && "opacity-75 grayscale-50",
        )}
      >
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={event.cover}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            placeholder="blur"
          />
          {status === "ongoing" && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-2 animate-pulse">
              <ClockIcon className="size-4" />
              En cours
            </div>
          )}
          {status === "finished" && (
            <div className="absolute top-2 left-2 bg-gray-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-2">
              Terminé
            </div>
          )}
          {status === "upcoming" && (
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-2">
              À venir
            </div>
          )}
          {isTicketAvailable && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold shadow-md flex items-center gap-2 animate-pulse">
              <TicketIcon className="size-4" />
              Billets disponibles
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col grow gap-4">
          <div className="grow">
            <h2 className="font-paytone text-xl lg:text-2xl mb-2 line-clamp-2 leading-tight">
              {event.title}
            </h2>

            <div className="flex flex-col gap-2 text-sm text-secondary-foreground/80">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 shrink-0" />
                <span>
                  {new Date(event.starting_date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {event.ending_date &&
                    ` - ${new Date(event.ending_date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPinIcon className="size-4 shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-auto">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-background/50 px-2 py-1 rounded-md font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
