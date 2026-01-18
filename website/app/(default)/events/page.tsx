import { events } from "#velite";
import { EventsList } from "@/components/events/EventsList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | BDE Grimm",
  description: "Découvrez tous les events organisés par le BDE Grimm.",
};

export default function EventsPage() {
  return (
    <div className="container mx-auto px-5 lg:px-8 py-10 lg:py-20 flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <h1 className="font-paytone text-4xl lg:text-6xl text-center lg:text-left">
          Nos Events
        </h1>
        <p className="text-muted-foreground text-center lg:text-left text-lg max-w-2xl">
          Retrouvez ici tous les events passés et à venir. Utilisez les filtres pour
          trouver ce que vous cherchez !
        </p>
      </div>

      <EventsList events={events} />
    </div>
  );
}
