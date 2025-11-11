import { CardBody, CardContainer, CardItem } from "@/components/ui/3dCard";
import { auth } from "@/lib/auth";
import { headers as nextHeaders } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import QRCode from "react-qr-code";

const PassPage = async () => {
  const headers = await nextHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session) return redirect("/");

  return (
    <CardContainer
      className="w-90 lg:w-150 aspect-[0.7] bg-accent rounded-4xl border-orange border-4"
      containerClassName="relative size-full flex items-center justify-center"
    >
      <CardBody className="flex flex-col gap-5 lg:gap-9 size-full p-4 lg:p-8 pr-7 lg:pr-12">
        <CardItem translateZ="20" className="flex flex-col gap-5 lg:gap-9">
          <div className="flex gap-2 items-center">
            <div className="relative w-10 h-15 lg:w-20 lg:h-25">
              <Image alt="étoile" src="/star.svg" fill={true} objectPosition="center" />
            </div>
            <h1 className="font-paytone text-4xl lg:text-6xl">Grimm Pass</h1>
          </div>
          <h1 className="font-paytone text-2xl lg:text-5xl">{session.user.name}</h1>
          <p className="font-archivo text-2xl lg:text-5xl">
            Soutient Grimm depuis le {session.user.createdAt.toLocaleDateString("fr-FR")}
          </p>
        </CardItem>
        <div className="absolute size-full top-0 left-0 scale-[100.5%] rounded-4xl overflow-hidden">
          <p className="absolute right-0 top-[50%] -translate-y-[50%] translate-x-[50%] origin-bottom -rotate-90 bg-orange text-orange-foreground font-paytone text-xl lg:text-5xl text-nowrap">
            VOTEZ GRIMM * VOTEZ GRIMM * VOTEZ GRIMM * VOTEZ GRIMM * VOTEZ GRIMM * VOTEZ
            GRIMM * VOTEZ GRIMM * VOTEZ GRIMM * VOTEZ GRIMM
          </p>
        </div>
        <CardItem
          translateZ="20"
          className="w-full h-full flex items-center justify-center"
        >
          <QRCode
            className="p-3 bg-orange rounded-2xl"
            size={256}
            style={{ height: "auto", width: "50%" }}
            value={`${process.env.BASE_URL!}/users/${session.user.login}`}
            viewBox={`0 0 256 256`}
            bgColor="var(--orange)"
            fgColor="var(--on-orange)"
          />
        </CardItem>
        <div className="absolute top-0 left-0 opacity-15 -z-1 size-full">
          <Image
            className="size-full"
            src="/grimm-logo-round.svg"
            alt="Logo Grimm"
            fill={true}
            objectPosition="center"
            objectFit="cover"
          />
        </div>
      </CardBody>
    </CardContainer>
  );
};

export default PassPage;
