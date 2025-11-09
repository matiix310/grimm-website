"use client";

import { cn } from "@/lib/utils";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/Carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { Bureau } from "@/db/schema/bureau";

type BureauCarouselProps = { bureau: Bureau[] } & React.ComponentProps<typeof Carousel>;

const BureauCarousel = ({ bureau, className, ...rest }: BureauCarouselProps) => {
  return (
    <Carousel
      className={cn("static lg:hidden mt-5", className)}
      opts={{ loop: true }}
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
      {...rest}
    >
      <CarouselContent>
        {bureau.map((b) => (
          <CarouselItem key={b.login}>
            <div
              className="rounded-3xl flex flex-col gap-2 justify-around items-center font-paytone w-full overflow-hidden p-5 aspect-[0.7] pl-5"
              style={{
                backgroundColor: `var(--${b.color})`,
                color: `var(--on-${b.color})`,
              }}
            >
              <div className="relative size-full">
                <Image
                  className="rounded-2xl"
                  alt={`Profil de ${b.name}`}
                  src={b.image}
                  fill={true}
                  objectFit="cover"
                  objectPosition="center"
                />
              </div>
              <p className="text-2xl text-center leading-[100%]">{b.name}</p>
              <p className="text-xl font-archivo text-center leading-[100%]">{b.role}</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="w-full flex gap-20 justify-center mt-5">
        <CarouselPrevious className="static translate-0 top-0 left-0 size-12" />
        <CarouselNext className="static translate-0 top-0 left-0 size-12" />
      </div>
    </Carousel>
  );
};

export { BureauCarousel };
