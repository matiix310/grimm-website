import { cn } from "@/lib/utils";
import React from "react";

type BureauCarouselProps = {} & React.ComponentProps<"div">;

const BureauCarousel = ({ className, ...rest }: BureauCarouselProps) => {
  return (
    <div className={cn("[--card-width:20em] flex flex-col gap-5", className)} {...rest}>
      <div className="flex gap-15 ml-8 items-center">
        <div className="w-[calc(var(--card-width)*1.2)] aspect-[0.65] bg-pink rounded-3xl"></div>
        <div className="w-(--card-width) aspect-[0.65] bg-green rounded-3xl"></div>
        <div className="w-(--card-width) aspect-[0.65] bg-blue rounded-3xl"></div>
        <div className="w-(--card-width) aspect-[0.65] bg-yellow rounded-3xl"></div>
      </div>
      <div className="flex gap-2 items-center h-10 w-full justify-center">
        <div className="size-6 rounded-full bg-secondary cursor-pointer" />
        <div className="size-5 rounded-full bg-muted cursor-pointer hover:bg-secondary/80 transition-all ease-in-out" />
        <div className="size-5 rounded-full bg-muted cursor-pointer hover:bg-secondary/80 transition-all ease-in-out" />
        <div className="size-5 rounded-full bg-muted cursor-pointer hover:bg-secondary/80 transition-all ease-in-out" />
      </div>
    </div>
  );
};

export { BureauCarousel };
