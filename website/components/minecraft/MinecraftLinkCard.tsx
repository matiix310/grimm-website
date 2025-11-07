"use client";

import React from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { redirect, useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { $fetch } from "@/lib/betterFetch";

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
  const searchParams = useSearchParams();

  const handleLinkClick = async () => {
    setLoading(true);

    const { error } = await $fetch("@post/api/users/:id/minecraft/link", {
      params: { id: userLogin },
      body: {
        username,
      },
    });

    setLoading(false);

    if (error) throw new Error(error.message);

    // TODO: success page
    return redirect(searchParams.get("redirect") ?? "/");
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
