"use client";

import type { InferQueryModel } from "@/db";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import * as motion from "motion/react-client";

type BestPlayersProps = {
  players: InferQueryModel<
    "ranking",
    {
      user: {
        columns: {
          name: true;
          login: true;
        };
      };
    },
    {
      rank: true;
      points: true;
    }
  >[];
} & React.ComponentProps<"div">;

const BestPlayers = ({ players, className, ...rest }: BestPlayersProps) => {
  return (
    <div className={cn("flex-1 flex flex-col justify-center gap-3", className)} {...rest}>
      {players.map((player) => (
        <Link key={player.user.login} href={`/users/${player.user.login}`}>
          <div
            className={cn(
              "flex w-full font-paytone text-5xl items-center rounded-lg transition-colors duration-300 ease-in-out p-2 hover:bg-accent",
              player.rank === 1
                ? "text-primary"
                : player.rank === 2
                ? "text-blue"
                : player.rank == 3
                ? "text-green"
                : "text-foreground"
            )}
          >
            <p className="w-20 text-6xl">{player.rank}.</p>
            <p className="flex-1">{player.user.name}</p>
            <p className="text-6xl">{player.points}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default BestPlayers;
