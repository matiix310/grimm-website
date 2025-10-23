import { MainCarousel } from "@/components/home/MainCarousel";
import { Navbar } from "@/components/home/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="w-full flex justify-center mt-10">
        <MainCarousel className="w-[80%]" />
      </div>
    </div>
  );
}
