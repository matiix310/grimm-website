"use client";

import React from "react";
import { AdminEventCreateButton } from "@/components/admin/events/AdminEventCreateButton";
import { AdminEventsTable } from "@/components/admin/events/AdminEventsTable";
import { Events } from "@/db/schema/events";
import { $fetch } from "@/lib/betterFetch";

const EventsPage = () => {
  const [events, setEvents] = React.useState<Events[]>([]);

  React.useEffect(() => {
    $fetch("/api/events").then(({ data, error }) => {
      if (error) throw new Error(error.message);

      setEvents(data);
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <AdminEventCreateButton
        onNewEvent={(event) => setEvents((old) => [...old, event])}
      />
      <AdminEventsTable
        events={events}
        onRemoveEvent={(eventId) =>
          setEvents((old) => old.filter((e) => e.id !== eventId))
        }
        onUpdateEvent={(event) =>
          setEvents((old) => [...old.filter((e) => e.id !== event.id), event])
        }
      />
    </div>
  );
};

export default EventsPage;
