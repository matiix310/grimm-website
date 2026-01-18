"use client";

import { useState, useMemo } from "react";
import { EventCard } from "./EventCard";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  SearchIcon,
  SlidersHorizontalIcon,
  MapPinIcon,
  TagIcon,
  CalendarIcon,
} from "lucide-react";
import { events } from "#velite";

type Event = (typeof events)[number];

interface EventsListProps {
  events: Event[];
}

export function EventsList({ events }: EventsListProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Extract unique tags and locations
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    events.forEach((e) => e.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [events]);

  const allLocations = useMemo(() => {
    const locations = new Set<string>();
    events.forEach((e) => locations.add(e.location));
    return Array.from(locations).sort();
  }, [events]);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Search filter
        const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());

        // Tag filter
        const matchesTags =
          selectedTags.length === 0 || selectedTags.every((t) => event.tags.includes(t));

        // Location filter
        const matchesLocation =
          selectedLocation === null || event.location === selectedLocation;

        // Date filter
        let matchesDate = true;
        if (dateRange?.from) {
          const eventStart = new Date(event.starting_date);
          const eventEnd = event.ending_date ? new Date(event.ending_date) : eventStart;
          const rangeStart = dateRange.from;
          const rangeEnd = dateRange.to || dateRange.from;

          // Check if event overlaps with selected range
          // Overlap logic: eventStart <= rangeEnd && eventEnd >= rangeStart
          matchesDate = eventStart <= rangeEnd && eventEnd >= rangeStart;
        }

        return matchesSearch && matchesTags && matchesLocation && matchesDate;
      })
      .sort((a, b) => {
        const now = new Date();

        const getStatusRank = (e: Event) => {
          const start = new Date(e.starting_date);
          const end = e.ending_date ? new Date(e.ending_date) : start;

          if (now > end) return 2; // Finished
          if (now >= start) return 0; // Ongoing
          return 1; // Upcoming
        };

        const rankA = getStatusRank(a);
        const rankB = getStatusRank(b);

        if (rankA !== rankB) return rankA - rankB;

        // Same status: Prioritize tickets
        const hasTickets = (e: Event) =>
          e.ticket_link &&
          e.ticket_opening_date &&
          e.ticket_closing_date &&
          now >= new Date(e.ticket_opening_date) &&
          now <= new Date(e.ticket_closing_date);

        const aTickets = hasTickets(a);
        const bTickets = hasTickets(b);

        if (aTickets && !bTickets) return -1;
        if (!aTickets && bTickets) return 1;

        // Same status and ticket availability: Sort by date
        // Ongoing/Upcoming: Soonest start date first
        // Finished: Most recent start date first
        if (rankA === 2) {
          return (
            new Date(b.starting_date).getTime() - new Date(a.starting_date).getTime()
          );
        }
        return new Date(a.starting_date).getTime() - new Date(b.starting_date).getTime();
      });
  }, [events, search, selectedTags, selectedLocation, dateRange]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Controls Section */}
      <div className="flex flex-col gap-6 bg-secondary/30 p-6 rounded-3xl">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
          <Input
            placeholder="Rechercher un event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-lg bg-background border-none focus:ring-0 transition-all"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tags Filter */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <TagIcon className="size-4" />
              <span>Filtrer par tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  variant={selectedTags.includes(tag) ? "primary" : "secondary"}
                  size="sm"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <MapPinIcon className="size-4" />
              <span>Filtrer par lieu</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allLocations.map((location) => (
                <Button
                  key={location}
                  onClick={() =>
                    setSelectedLocation(location === selectedLocation ? null : location)
                  }
                  variant={selectedLocation === location ? "primary" : "secondary"}
                  size="sm"
                >
                  {location}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <CalendarIcon className="size-4" />
              <span>Filtrer par date</span>
            </div>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
        </div>
      </div>

      {/* Results Section */}
      {filteredAndSortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {filteredAndSortedEvents.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 flex flex-col items-center gap-4 text-muted-foreground">
          <div className="bg-secondary/50 p-6 rounded-full">
            <SlidersHorizontalIcon className="size-10" />
          </div>
          <p className="text-xl">Aucun event ne correspond à votre recherche.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setSelectedTags([]);
              setSelectedLocation(null);
              setDateRange(undefined);
            }}
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
