import Ranking from "@/components/ranking/ranking";
import { db } from "@/db";
import { cn } from "@/lib/utils";
import Link from "next/link";

const RankingPage = async () => {
  const bestPlayers = await db.query.ranking.findMany({
    limit: 3,
    orderBy: (ranking, { asc }) => [asc(ranking.rank)],
    with: {
      user: {
        columns: {
          name: true,
          login: true,
        },
      },
    },
    columns: {
      rank: true,
      points: true,
    },
  });

  return (
    <div className="flex flex-col px-8 size-full">
      <h1 className="font-paytone text-7xl">Classement</h1>
      <div className="flex gap-50 h-full">
        <div className="flex-1 flex flex-col justify-center gap-6">
          {bestPlayers.map((player) => (
            <Link key={player.user.login} href={`/users/${player.user.login}`}>
              <div
                className={cn(
                  "flex w-full font-paytone text-5xl items-center",
                  player.rank === 1
                    ? "text-primary"
                    : player.rank === 2
                    ? "text-blue"
                    : "text-green"
                )}
              >
                <p className="w-20 text-6xl">{player.rank}.</p>
                <p className="flex-1">{player.user.name}</p>
                <p className="text-6xl">{player.points}</p>
              </div>
            </Link>
          ))}
        </div>
        <Ranking className="flex-1" />
      </div>
    </div>
  );
};

export default RankingPage;
