"use client";

import { redirect } from "next/navigation";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

type AlreadyAnsweredCardProps = {
  answerName: string;
};

const AlreadyAnsweredCard = ({ answerName }: AlreadyAnsweredCardProps) => {
  return (
    <Card className="absolute top-[50%] left-[50%] -translate-[50%]">
      <h1 className="font-paytone text-3xl">{answerName}</h1>
      <p className="font-archivo text-2xl">Vous avez déja répondu à cette question</p>
      <Button size="lg" onClick={() => redirect("/")}>
        Revenir à l&apos;accueil
      </Button>
    </Card>
  );
};

export { AlreadyAnsweredCard };
