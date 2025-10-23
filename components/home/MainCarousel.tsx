import { cn } from "@/lib/utils";
import Image from "next/image";

type MainCarouselProps = {} & React.ComponentProps<"div">;

const MainCarousel = ({ className }: MainCarouselProps) => {
  return (
    <div className={cn("relative", className)}>
      <Image
        className="size-full"
        src="/main-carousel-background.svg"
        alt=""
        width={100}
        height={100}
        priority
      />
      <div className="absolute top-0 left-0 size-full flex items-center justify-between gap-10">
        <div className="h-[70%] ml-10 flex-6 flex flex-col gap-10 justify-center">
          <h1 className="text-primary-foreground text-7xl">
            Votez votre nouveau BDE, votez GRIMM
          </h1>
          <p className="text-primary-foreground text-4xl">
            La campagne BDE est officiellement ouverte ! Du 05 novembre au 15 septembre,
            rendez-vous sur le le site qlqchose.fr pour votez pour le BDE qui vous
            représentera sur l’année 2025-2026
          </p>
        </div>
        <Image
          className="h-[70%] mr-10 w-auto flex-4"
          src="/logo.svg"
          alt="Logo Grimm Texte"
          width={100}
          height={100}
          priority
        />
      </div>
      <div className="absolute bottom-10 right-5 flex gap-2 w-46 h-3">
        <div className="size-full rounded-full bg-background cursor-pointer transition-all ease-in-out hover:opacity-80">
          <div className="h-full w-[50%] rounded-full bg-secondary"></div>
        </div>
        <div className="size-full rounded-full bg-background cursor-pointer transition-all ease-in-out hover:opacity-80" />
        <div className="size-full rounded-full bg-background cursor-pointer transition-all ease-in-out hover:opacity-80" />
      </div>
    </div>
  );
};

export { MainCarousel };
