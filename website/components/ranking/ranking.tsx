"use client";

import { InferQueryModel } from "@/db";
import { cn } from "@/lib/utils";
import { RefreshCw, SearchX } from "lucide-react";
import Link from "next/link";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/Pagination";

const defaultOffset = 3;
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

  const totalPages = React.useMemo(
    () => Math.ceil((totalPlayers - defaultOffset) / playerPerPage),
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
    fetch(
      `/api/ranking?limit=${playerPerPage}&offset=${
        currentPageCopy * playerPerPage + defaultOffset
      }`
    ).then(async (res) => {
      if (res.status !== 200) {
        setCacheAt(currentPageCopy, null);
        throw new Error("Error while fetching the ranking");
      }

      const json = await res.json();

      if (json.error) {
        setCacheAt(currentPageCopy, null);
        throw new Error(json.message);
      }

      setTotalPlayers(json.data.total);

      setCacheAt(currentPageCopy, json.data.ranking);
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
          cache[currentPage].map((player) => (
            <Link key={player.user.login} href={`/users/${player.user.login}`}>
              <div className="flex w-full font-paytone text-4xl items-center">
                <p className="w-30 text-5xl">{player.rank}.</p>
                <p className="flex-1">{player.user.name}</p>
                <p className="text-5xl">{player.points}</p>
              </div>
            </Link>
          ))
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
        <Pagination className="w-fit mx-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                content="Précedent"
                onClick={() => setCurrentPage((old) => Math.max(0, old - 1))}
              />
            </PaginationItem>
            {totalPages > 4 ? (
              <>
                {currentPage > 1 && (
                  <>
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(0)}>1</PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  </>
                )}

                {currentPage > 0 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(currentPage - 1)}>
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationLink isActive>{currentPage + 1}</PaginationLink>
                </PaginationItem>

                {currentPage + 1 < totalPages && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(currentPage + 1)}>
                      {currentPage + 2}
                    </PaginationLink>
                  </PaginationItem>
                )}

                {currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(totalPages - 1)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
              </>
            ) : (
              [...Array(totalPages).keys()].map((i) => (
                <PaginationItem key={i}>
                  <PaginationLink isActive={currentPage === i}>{i + 1}</PaginationLink>
                </PaginationItem>
              ))
            )}
            <PaginationItem>
              <PaginationNext
                content="Suivant"
                onClick={() => setCurrentPage((old) => Math.min(totalPages - 1, old + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default Ranking;
