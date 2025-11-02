"use client";

import { InferQueryModel } from "@/db";
import { cn } from "@/lib/utils";
import { RefreshCw, SearchX } from "lucide-react";
import Link from "next/link";
import React from "react";
import { FullPagination } from "../ui/FullPagination";
import { $fetch } from "@/lib/betterFetch";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";

const defaultOffset = 0;
const playerPerPage = 10;

type RankingProps = {} & React.ComponentProps<"div">;

const Ranking = ({ className, ...rest }: RankingProps) => {
  const [cache, setCache] = React.useState<
    (
      | Pick<
          InferQueryModel<"ranking", { user: { columns: { name: true; login: true } } }>,
          "rank" | "points" | "user"
        >[]
      | null
    )[]
  >([]);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [totalPlayers, setTotalPlayers] = React.useState(0);
  const [currentHover, setCurrentHover] = React.useState<number>();

  const totalPages = React.useMemo(
    () =>
      totalPlayers <= defaultOffset
        ? 0
        : Math.ceil((totalPlayers - defaultOffset) / playerPerPage),
    [totalPlayers]
  );

  const setCacheAt = React.useCallback((index: number, data: (typeof cache)[number]) => {
    setCache((old) => {
      const copy = [...old];
      copy[index] = data;
      return copy;
    });
  }, []);

  React.useEffect(() => {
    if (cache[currentPage] !== undefined) return;

    const currentPageCopy = currentPage;
    $fetch("/api/ranking", {
      query: {
        limit: playerPerPage,
        offset: currentPageCopy * playerPerPage + defaultOffset,
      },
    }).then(({ data, error }) => {
      if (error) {
        setCacheAt(currentPageCopy, null);
        throw new Error(error.message);
      }

      setTotalPlayers(data.total);
      setCacheAt(currentPageCopy, data.ranking);
    });
  }, [currentPage, cache, setCacheAt]);

  return (
    <div
      className={cn("relative flex flex-col size-full justify-between", className)}
      {...rest}
    >
      {cache[currentPage] ? (
        cache[currentPage].length === 0 ? (
          <>
            <div className="flex items-center gap-2 absolute top-[50%] left-[50%] -translate-[50%]">
              <SearchX size={20} />
              <h1>Aucun joueurs (big flop)</h1>
            </div>
            <div />
          </>
        ) : (
          <div className="flex-col gap-0">
            {cache[currentPage].map((player, i) => (
              <Link key={player.user.login} href={`/users/${player.user.login}`}>
                <motion.div
                  className="relative flex w-full font-paytone text-4xl items-center p-1"
                  onHoverStart={() => setCurrentHover(i)}
                  onHoverEnd={() => setCurrentHover(undefined)}
                >
                  <p className="w-30 text-5xl">{player.rank}.</p>
                  <p className="flex-1">{player.user.name}</p>
                  <p className="text-5xl">{player.points}</p>
                  {currentHover === i && (
                    <motion.div
                      layoutId="ranking-bg-button"
                      className="absolute size-full bg-accent -z-1 top-0 left-0 rounded-md"
                    />
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <>
          <RefreshCw className="animate-spin size-10 absolute top-[50%] left-[50%] -translate-[50%]" />
          <div />
        </>
      )}
      <div className="flex justify-between items-center mb-5">
        <p className="font-archivo">
          {totalPlayers} joueur{totalPlayers > 1 ? "s" : ""}
        </p>
        <FullPagination
          selectedPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export { Ranking };
