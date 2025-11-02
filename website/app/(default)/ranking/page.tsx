import BestPlayers from "@/components/ranking/BestPlayers";
import { Ranking } from "@/components/ranking/ranking";
import { RefreshRankingButton } from "@/components/ranking/refreshRankingButton";
import { db } from "@/db";
import { hasPermission } from "@/utils/auth";
import { headers } from "next/headers";

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

  const canRefresh = await hasPermission({
    headers: await headers(),
    permissions: { ranking: ["force-refresh"] },
  });

  return (
    <div className="flex flex-col px-8 size-full">
      <div className="flex gap-2 items-center">
        <h1 className="font-paytone text-7xl">Classement</h1>
        {canRefresh && <RefreshRankingButton className="mt-2" />}
      </div>
      <div className="flex gap-45 h-full">
        <BestPlayers players={bestPlayers} />
        <Ranking className="flex-1" />
      </div>
    </div>
  );
};

export default RankingPage;
