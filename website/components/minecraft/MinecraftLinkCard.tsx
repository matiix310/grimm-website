"use client";

import React from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { redirect } from "next/navigation";
import { RefreshCw } from "lucide-react";

type MinecraftLinkCardProps = {
  userLogin: string;
  username: string;
  alreadyLinked?: boolean;
};

const MinecraftLinkCard = ({
  userLogin,
  username,
  alreadyLinked = false,
}: MinecraftLinkCardProps) => {
  const [loading, setLoading] = React.useState(false);

  const handleLinkClick = async () => {
    setLoading(true);

    const res = await fetch(`/api/users/${userLogin}/minecraft/link`, {
      method: "POST",
      body: JSON.stringify({
        username,
      }),
    });

    setLoading(false);

    if (res.status !== 200) throw new Error("Error while creating the api key");

    const json = await res.json();

    if (json.error) throw new Error(json.message);

    // TODO: success page
    redirect("/");
  };

  return (
    <Card className="absolute top-[50%] left-[50%] -translate-[50%]">
      {alreadyLinked ? (
        <p className="font-paytone text-4xl">
          Vous avez déja lié votre compte Grimm au compte Minecraft &quot;
          <span className="text-accent">{username}</span>&quot;. Si c&apos;est une erreur,
          veuillez contacter un membre du BDE pour délier l&apos;ancien compte.
        </p>
      ) : (
        <>
          <p className="font-paytone text-4xl">
            Voullez vous vraiment lier votre compte Grimm au compte minecraft &quot;
            <span className="text-accent">{username}</span>&quot; ?
          </p>
          <Button disabled={loading} size="lg" onClick={() => handleLinkClick()}>
            {loading && <RefreshCw className="animate-spin" />}
            Lier
          </Button>
        </>
      )}
    </Card>
  );
};

export { MinecraftLinkCard };
