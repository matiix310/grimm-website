"use client";

import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/authClient";
import Image from "next/image";

const LoginPage = () => {
  const handleForgeIdClick = async () => {
    const { error } = await authClient.signIn.oauth2({
      providerId: "forge-id",
      callbackURL: "/",
      errorCallbackURL: "/",
      newUserCallbackURL: "/",
      disableRedirect: false,
      scopes: ["profile"],
      requestSignUp: false,
    });

    if (error) throw new Error(error.message);
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center">
      <Image
        className="absolute top-0 left-0 h-full w-auto p-15 opacity-20 -z-1"
        src="/crystal-ball.svg"
        alt="Logo Grimm Texte"
        width={100}
        height={100}
        priority
      />
      <div className="bg-secondary flex flex-col gap-10 w-150 rounded-4xl p-10">
        <h1 className="text-4xl font-paytone text-secondary-foreground">
          Se connecter au site web du BDE GRIMM
        </h1>
        <div className="w-full flex justify-center">
          <Button className="w-[80%]" onClick={() => handleForgeIdClick()}>
            Se connecter avec ForgeID
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
