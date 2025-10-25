import { BureauCarousel } from "@/components/home/BureauCarousel";
import { MainCarousel } from "@/components/home/MainCarousel";
import { Navbar } from "@/components/home/Navbar";
import { db } from "@/db";

const Home = async () => {
  const news = await db.query.news.findMany();

  return (
    <div>
      <Navbar className="fixed top-0 left-0 w-full z-10 bg-background" />
      <section className="w-screen h-screen flex justify-center items-center pt-25">
        <MainCarousel className="w-[80%] h-fit" carouselContent={news} />
      </section>
      <section id="bureau" className="w-screen h-screen pt-25 flex flex-col">
        <h1 className="font-paytone text-7xl ml-8">Le Bureau</h1>
        <BureauCarousel className="h-full flex justify-center" />
      </section>
      <section id="events" className="w-screen h-screen pt-25 flex flex-col">
        <h1 className="font-paytone text-7xl ml-8">Les Events</h1>
        {/* TODO */}
      </section>
    </div>
  );
};

export default Home;
