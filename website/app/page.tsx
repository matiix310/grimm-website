import { Navbar } from "@/components/home/Navbar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { db } from "@/db";
import { events as eventsSchema } from "@/db/schema/events";
import { asc } from "drizzle-orm";
import Image from "next/image";
import { connection } from "next/server";
import { BureauCarousel } from "@/components/home/BureauCarousel";
import { bureau as bureauSchema } from "@/db/schema/bureau";
import Link from "next/link";
import { SpamLink } from "@/components/ui/SpamLink";

const Home = async () => {
  // prevent nextjs from prerendering this page
  // as it involves database content
  await connection();

  const [events, bureau] = await Promise.all([
    db.query.events.findMany({
      orderBy: asc(eventsSchema.date),
      limit: 3,
    }),
    db.query.bureau.findMany({ orderBy: asc(bureauSchema.index) }),
  ]);

  return (
    <div>
      <Navbar className="fixed top-0 left-0 w-full z-10" />
      <section className="relative w-full lg:h-110 mt-25 lg:bg-pink flex flex-col items-center lg:block">
        <div className="relative lg:absolute top-0 lg:right-20 h-auto lg:h-130 w-[80%] lg:w-130 bg-blue p-10 pb-12 rounded-b-full outline-10 outline-black/10">
          <div className="h-full aspect-square">
            <Image
              className="size-full p-4 lg:p-8 ml-2.5 lg:ml-4"
              alt="on vous veut!"
              src="/on-vous-veut.svg"
              fill={true}
              objectPosition="center"
              objectFit="contain"
            />
          </div>
          <SpamLink
            href="https://liste.bde-grimm.com/redeem/qke0xugm64snog0nqo4y8x6w"
            count={10}
            className="absolute top-0 left-0 size-full"
          />
        </div>
        <div className="flex flex-col gap-5 lg:gap-10 text-foreground lg:text-pink-foreground lg:w-[60%] mt-8 lg:mt-0 px-5 lg:px-15 h-full justify-center text-center lg:text-start">
          <h1 className="font-paytone text-3xl lg:text-7xl">
            Votez votre nouveau BDE! Votez GRIMM !!
          </h1>
          <p className="text-xl lg:text-3xl">
            La campagne BDE est officiellement ouverte ! Du 10 novembre au 15 novembre,
            rendez-vous sur les sites de Villejuif et Kremlin-Bicêtre pour participer aux
            évévenements organisés par les listes pour le BDE de l’année 2025-2026 !
          </p>
        </div>
      </section>
      <section
        id="socials"
        className="w-full pt-28 -mt-15 lg:mt-0 flex flex-col px-5 lg:px-20"
      >
        <div className="flex gap-2 items-center">
          <div className="relative w-10 h-15 lg:w-20 lg:h-25">
            <Image alt="étoile" src="/star.svg" fill={true} objectPosition="center" />
          </div>
          <h1 className="font-paytone text-3xl lg:text-7xl">Nos réseaux</h1>
        </div>
        <div className="flex flex-col lg:flex-row justify-around items-center gap-2 mt-5 lg:mt-10">
          <Link href="/to/instagram" target="_blank">
            <Button variant="secondary" size="lg" className="flex gap-2 items-center">
              <svg
                className="w-8"
                fill="var(--on-secondary)"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
              </svg>
              Instagram
            </Button>
          </Link>
          <Link href="/to/discord" target="_blank">
            <Button variant="secondary" size="lg" className="flex gap-2 items-center">
              <svg
                className="w-8"
                fill="var(--on-secondary)"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
              Discord
            </Button>
          </Link>
        </div>
      </section>
      <section
        id="events"
        className="w-full pt-28 -mt-15 lg:mt-0 flex flex-col px-5 lg:px-20"
      >
        <div className="flex gap-2 items-center">
          <div className="relative w-10 h-15 lg:w-20 lg:h-25">
            <Image alt="étoile" src="/star.svg" fill={true} objectPosition="center" />
          </div>
          <h1 className="font-paytone text-3xl lg:text-7xl">Les Events</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-10 mt-5 lg:mt-10">
          {events.map((event) => (
            <div
              key={event.id}
              className="relative w-full aspect-video bg-accent rounded-4xl overflow-hidden after:size-full after:absolute after:top-0 after:left-0 after:transition-all after:ease-in-out hover:after:bg-primary/70 hover:*:data-[slot=overlay]:opacity-100"
              style={{
                background: `url(${event.image})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Skeleton className="absolute left-0 top-0 size-full -z-1" />
              <div
                data-slot="overlay"
                className="opacity-0 absolute z-2 top-[50%] left-[50%] -translate-[50%] font-paytone text-5xl text-primary-foreground flex flex-col items-center"
              >
                <span>{event.date.toLocaleDateString("fr-FR")}</span>
                <span className="text-2xl">{event.date.toLocaleTimeString("fr-FR")}</span>
              </div>
              <div className="flex flex-col gap-2 items-end absolute bottom-5 right-5 font-paytone z-2">
                {/* <p className="bg-red text-red-foreground px-5 py-2 rounded-full text-sm lg:text-lg">
                  A venir
                </p> */}
                <p className="bg-secondary text-secondary-foreground px-5 py-2 rounded-full text-sm lg:text-lg">
                  {event.name}
                </p>
                <p className="static lg:hidden bg-secondary text-secondary-foreground px-5 py-2 rounded-full text-sm">
                  {event.date.toLocaleDateString("fr-FR")}{" "}
                  {event.date.toLocaleTimeString("fr-FR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section
        id="bureau"
        className="w-full pt-28 -mt-15 lg:mt-0 flex flex-col px-5 lg:px-20"
      >
        <div className="flex gap-2 items-center">
          <div className="relative w-10 h-15 lg:w-20 lg:h-25">
            <Image alt="étoile" src="/star.svg" fill={true} objectPosition="center" />
          </div>
          <h1 className="font-paytone text-3xl lg:text-7xl">Le Bureau</h1>
        </div>
        <div className="hidden lg:flex gap-4 w-full mt-10">
          {bureau.map((b) => (
            <div
              key={b.login}
              className="rounded-3xl flex flex-col gap-2 justify-around items-center font-paytone size-full overflow-hidden p-5 aspect-[0.7]"
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
              <p className="text-lg text-center leading-[100%]">{b.name}</p>
              <p className="font-archivo text-lg text-center leading-[100%]">{b.role}</p>
            </div>
          ))}
        </div>
        <BureauCarousel bureau={bureau} />
      </section>
      <section className="pt-30 w-full -mt-15 lg:mt-0 flex flex-col overflow-hidden">
        <div className="relative w-full aspect-[3]">
          <Image
            className="scale-105"
            alt="Loup hurlant à la lune"
            src="/footer.svg"
            fill={true}
            objectFit="cover"
            objectPosition="center"
          />
        </div>
        <div className="bg-black w-full h-30 pt-5 px-5 lg:px-20 text-background flex items-center justify-between">
          <div className="flex gap-3 lg:gap-6">
            <Link href="/to/instagram" target="_blank">
              <Button size="icon" variant="link">
                <svg
                  className="transition-colors duration-300 hover:fill-[#FF0069]"
                  fill="var(--background)"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Instagram</title>
                  <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
                </svg>
              </Button>
            </Link>
            <Link href="/to/discord" target="_blank">
              <Button size="icon" variant="link">
                <svg
                  className="transition-colors duration-300 hover:fill-[#5865F2]"
                  fill="var(--background)"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Discord</title>
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                </svg>
              </Button>
            </Link>
          </div>
          <Link href="https://liste.bde-grimm.com/redeem/yu4cws3ci85nmir8uymvfip0">
            <h1>Made With ❤️ By Liste BDE Grimm</h1>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
