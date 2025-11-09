"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { authClient } from "@/lib/authClient";
import Image from "next/image";
import React from "react";

const LoginPage = ({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) => {
  const params = React.use(searchParams);

  const handleForgeIdClick = React.useCallback(async () => {
    const { error } = await authClient.signIn.oauth2({
      providerId: "forge-id",
      callbackURL: params.redirect ?? "/",
      errorCallbackURL: "/",
      newUserCallbackURL: "/",
      disableRedirect: false,
      scopes: ["openid", "profile"],
      requestSignUp: false,
    });

    if (error) throw new Error(error.message);
  }, [params.redirect]);

  React.useEffect(() => {
    handleForgeIdClick();
  }, [handleForgeIdClick]);

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
      <Card>
        <h1 className="text-4xl font-paytone">
          Vous allez être redirigé vers la page de connexion de la forge...
        </h1>
        <div className="w-full flex justify-center">
          <Button className="w-[80%]" onClick={() => handleForgeIdClick()}>
            Forcer la redirection
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
