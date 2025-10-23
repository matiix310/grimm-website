import Image from "next/image";
import { Button } from "../ui/Button";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between my-4 mx-8">
      <Image
        className="h-[80%] w-auto cursor-pointer"
        src="/grimm.svg"
        alt="Logo Grimm Texte"
        width={100}
        height={100}
        priority
      />
      <div className="flex gap-5">
        <Button variant="secondary">Le Bureau</Button>
        <Button variant="secondary">Les Events</Button>
        <Button variant="primary">Se connecter</Button>
      </div>
    </div>
  );
};

export { Navbar };
