"use client";

import React from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { redirect } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { $fetch } from "@/lib/betterFetch";

type MinecraftAuthorizeCardProps = {
  username: string;
};

const MinecraftAuthorizeCard = ({ username }: MinecraftAuthorizeCardProps) => {
  const [loading, setLoading] = React.useState(false);

  const handleAuthorizeClick = async () => {
    setLoading(true);

    const { error } = await $fetch("@post/api/minecraft/:username/authorize", {
      params: { username },
    });

    setLoading(false);

    if (error) throw new Error(error.message);

    // TODO: success page
    redirect("/");
  };

  return (
    <Card className="absolute top-[50%] left-[50%] -translate-[50%]">
      <p className="font-paytone text-4xl">
        Voulez vous vraiment autoriser la connexion de votre compte minecraft &quot;
        {username}&quot; au serveur du BDE Grimm
      </p>
      <Button disabled={loading} size="lg" onClick={() => handleAuthorizeClick()}>
        {loading && <RefreshCw className="animate-spin" />}
        Autoriser
      </Button>
    </Card>
  );
};

export { MinecraftAuthorizeCard };
