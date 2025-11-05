import { Navbar } from "@/components/home/Navbar";
import { Skeleton } from "@/components/ui/Skeleton";
import { db } from "@/db";
import { events as eventsSchema } from "@/db/schema/events";
import { desc, gt } from "drizzle-orm";
import Image from "next/image";
import { connection } from "next/server";

const Home = async () => {
  // prevent nextjs from prerendering this page
  // as it involves database content
  await connection();

  const [events, bureau] = await Promise.all([
    db.query.events.findMany({
      orderBy: desc(eventsSchema.date),
      limit: 3,
    }),
    db.query.bureau.findMany(),
  ]);

  return (
    <div>
      <Navbar className="fixed top-0 left-0 w-full z-10" />
      <section className="relative w-screen h-110 mt-25 bg-pink">
        <div className="flex flex-col gap-10 text-pink-foreground w-[60%] px-15 h-full justify-center">
          <h1 className="font-paytone text-7xl">
            Votez votre nouveau BDE! Votez GRIMM !!
          </h1>
          <p className="text-3xl">
            La campagne BDE est officiellement ouverte ! Du 10 novembre au 15 novembre,
            rendez-vous sur les sites de Villejuif et Kremlin-Biceptre pour participer aux
            évévenements organisés par les listes pour le BDE de l’année 2025-2026 !
          </p>
        </div>
        <div className="absolute top-0 right-20 h-[130%] bg-blue p-10 pb-12 rounded-b-full outline-10 outline-black/10">
          <Image
            className="size-full ml-4"
            alt="on vous veut!"
            src="/on-vous-veut.svg"
            width={1000}
            height={1000}
          />
        </div>
      </section>
      <section id="events" className="w-screen pt-30 flex flex-col px-20">
        <div className="flex gap-2 items-center">
          <Image
            className="w-15"
            alt="étoile"
            src="/star.svg"
            height={1000}
            width={1000}
          />
          <h1 className="font-paytone text-7xl">Les Events</h1>
        </div>
        <div className="grid grid-cols-3 gap-10 mt-10">
          {events.map((event) => (
            <div
              key={event.id}
              className="relative w-full aspect-video bg-accent rounded-4xl overflow-hidden after:size-full after:absolute after:top-0 after:left-0 after:transition-all after:ease-in-out hover:after:bg-primary/70 hover:[&>span]:opacity-100"
              style={{
                background: `url(${event.image})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Skeleton className="absolute left-0 top-0 size-full -z-1" />
              <span className="opacity-0 absolute z-2 top-[50%] left-[50%] -translate-[50%] font-paytone text-5xl text-primary-foreground">
                {event.date.toLocaleDateString()}
              </span>
              <div className="flex flex-col gap-2 items-end absolute bottom-5 right-5 font-paytone z-2">
                <p className="bg-red text-red-foreground px-5 py-2 rounded-full text-lg">
                  A venir
                </p>
                <p className="bg-secondary text-secondary-foreground px-5 py-2 rounded-full text-lg">
                  {event.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section id="bureau" className="w-screen pt-30 flex flex-col px-20">
        <div className="flex gap-2 items-center">
          <Image
            className="w-15"
            alt="étoile"
            src="/star.svg"
            height={1000}
            width={1000}
          />
          <h1 className="font-paytone text-7xl">Le Bureau</h1>
        </div>
        <div className="flex gap-4 w-full mt-10">
          {bureau.map((b) => (
            <div
              key={b.login}
              className="rounded-3xl flex flex-col gap-2 justify-around items-center font-paytone size-full overflow-hidden p-5 h-100"
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
              <p className="text-xl text-center">{b.name}</p>
              <p className="text-lg text-center">{b.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
