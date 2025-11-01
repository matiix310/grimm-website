"use client";

import { cn } from "@/lib/utils";
import { useMotionValue, animate } from "motion/react";
import * as motion from "motion/react-client";
import Image from "next/image";
import React, { useEffect } from "react";

type MainCarouselProps = {
  carouselContent: { id: string; name: string; description: string; image: string }[];
} & React.ComponentProps<"div">;

const MainCarousel = ({ carouselContent, className }: MainCarouselProps) => {
  const [selected, setSelected] = React.useState(0);

  const progress = useMotionValue("-100%");

  useEffect(() => {
    progress.set("-100%");
    const controls = animate(progress, "0%", {
      duration: 10,
      ease: "linear",
      onComplete() {
        setSelected((old) => (old + 1) % carouselContent.length);
      },
    });

    return () => {
      controls.stop();
    };
  }, [selected, progress, carouselContent.length]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        className="size-full"
        src="/main-carousel-background.svg"
        alt=""
        width={100}
        height={100}
        priority
      />
      <div
        className="absolute top-0 left-0 size-full flex transition-all ease-in-out duration-400"
        style={{ transform: `translateX(calc(-100% * ${selected}))` }}
      >
        {carouselContent.map((carouselItem) => (
          <div
            key={carouselItem.id}
            className="min-w-full flex items-center justify-between gap-10"
          >
            <div className="h-[70%] ml-10 flex-6 flex flex-col gap-10 justify-center">
              <h1 className="text-primary-foreground text-6xl font-paytone">
                {carouselItem.name}
              </h1>
              <p className="text-primary-foreground text-4xl [font-family=font-archivo-narrow]">
                {carouselItem.description}
              </p>
            </div>
            <Image
              className="h-[70%] mr-10 w-auto flex-4"
              src="/grimm-logo-round.png"
              alt="Logo Grimm Texte"
              width={1080}
              height={1080}
              priority
            />
          </div>
        ))}
      </div>
      {carouselContent.length > 1 && (
        <div className="absolute bottom-10 right-5 flex gap-2 w-46 h-3">
          {carouselContent.map(({ id }, index) =>
            selected === index ? (
              <div
                key={id}
                className="size-full rounded-full bg-background cursor-pointer transition-all ease-in-out hover:opacity-80 overflow-hidden"
              >
                <motion.div
                  className="size-full rounded-full bg-secondary"
                  style={{ translateX: progress }}
                />
              </div>
            ) : (
              <div
                key={id}
                className="size-full rounded-full cursor-pointer transition-all ease-in-out hover:opacity-80 bg-background"
                onClick={() => {
                  setSelected(index);
                }}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export { MainCarousel };
