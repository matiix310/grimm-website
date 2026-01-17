import { events } from "#velite";
import { notFound } from "next/navigation";
import styles from "./index.module.css";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { TicketIcon } from "lucide-react";

const getEventBySlug = (slug: string) => {
  return events.find((e) => e.slug === slug);
};

export default async function Events({ params }: PageProps<"/events/[slug]">) {
  const slug = (await params).slug;
  const event = getEventBySlug(slug);

  if (event === undefined) return notFound();

  return (
    <div className="p-5 lg:p-10 flex flex-col gap-10 text-xs lg:text-base">
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-10">
        <div className="relative w-full aspect-video flex-1">
          <Image
            src={event.cover}
            alt={event.title}
            placeholder="blur"
            fill={true}
            objectFit="cover"
            objectPosition="center"
            className="rounded-4xl"
          />
        </div>
        <div className="flex-1 flex flex-col gap-5 lg:gap-10 justify-center">
          <h1 className="font-paytone text-3xl lg:text-6xl">{event.title}</h1>
          <div className="text-2xl lg:text-4xl flex gap-2 items-center">
            <p>📅</p>
            <div className="flex flex-col lg:flex-row">
              <p>
                {new Date(event.starting_date).toLocaleDateString("fr-FR")}{" "}
                {new Date(event.starting_date).toLocaleTimeString("fr-FR")}
              </p>
              {event.ending_date && (
                <>
                  <p className="hidden lg:block lg:mx-2"> - </p>
                  <p>
                    {new Date(event.ending_date).toLocaleDateString("fr-FR")}{" "}
                    {new Date(event.ending_date).toLocaleTimeString("fr-FR")}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="text-2xl lg:text-4xl flex gap-2 items-center">
            <p>📍</p>
            <a href={event.location_link} target="_blank">
              {event.location}
            </a>
          </div>
          <div className="flex gap-2">
            {event.tags.map((tag, i) => (
              <span
                key={i}
                className="text-base lg:text-2xl bg-secondary text-secondary-foreground px-4 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      {event.ticket_link &&
        event.ticket_opening_date &&
        event.ticket_closing_date &&
        new Date() >= new Date(event.ticket_opening_date) &&
        new Date() <= new Date(event.ticket_closing_date) && (
          <a href={event.ticket_link} target="_blank" className="w-full">
            <Button className="font-archivo text-3xl! w-full" variant="primary" size="lg">
              <TicketIcon />
              Acheter mon billet
            </Button>
          </a>
        )}
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: event.content }}
      />
    </div>
  );
}
