"use client";

import { AdventCalendar as AdventCalendarSchema } from "@/db/schema/adventCalendar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import React from "react";
import Link from "next/link";

type AdventCalendarDayProps = {
  adventCalendar: AdventCalendarSchema[];
} & React.ComponentProps<"div">;

const AdventCalendar = ({
  adventCalendar,
  className,
  ...rest
}: AdventCalendarDayProps) => {
  const [content, setContent] = React.useState<{ day: number; content: string }>();

  return (
    <>
      <Dialog
        open={content !== undefined}
        onOpenChange={(o) => setContent(o ? { day: -1, content: "" } : undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jour {content?.day ?? -1}</DialogTitle>
            <DialogDescription>
              Les surprises du calendrier de l&apos;avent sont publiés sur notre{" "}
              <Link href="/to/instagram" className="underline cursor-pointer">
                page instagram
              </Link>{" "}
              tous les jours !
            </DialogDescription>
          </DialogHeader>
          <p className="text-4xl">{content?.content ?? ""}</p>
        </DialogContent>
      </Dialog>
      <div
        className={cn(
          "grid grid-cols-5 lg:grid-cols-12 gap-5 lg:gap-10 items-center",
          className
        )}
        {...rest}
      >
        {adventCalendar.map((e) => (
          <div
            key={e.day}
            className={cn(
              e.content === null
                ? "bg-muted pointer-events-none"
                : "bg-secondary cursor-pointer",
              "text-secondary-foreground rounded-md xl:rounded-xl w-15 lg:w-15 xl:w-20 aspect-square flex items-center justify-center"
            )}
            onClick={() =>
              setContent({
                content: e.content ?? "Le contenu de ce jour n'a pas encore été révélé",
                day: e.day,
              })
            }
          >
            <p className="text-2xl xl:text-3xl">{e.day}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export { AdventCalendar };
