"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "../ui/Button";
import { X } from "lucide-react";
import { InferQueryModel } from "@/db";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/Tooltip";
import { $fetch } from "@/lib/betterFetch";

type PointsListProps = {
  defaultPoints: InferQueryModel<"points", { tags: { with: { tag: true } } }>[];
  canDeletePoints: boolean;
  userLogin: string;
} & React.ComponentProps<"div">;

const PointsList = ({
  defaultPoints,
  canDeletePoints,
  userLogin,
  className,
  ...rest
}: PointsListProps) => {
  const [points, setPoints] = React.useState(defaultPoints);

  const handlePointRemoval = async (pointId: string) => {
    const { data, error } = await $fetch("@delete/api/users/:id/points", {
      params: { id: userLogin },
      body: {
        id: pointId,
      },
    });

    if (error) throw new Error(error.message);

    setPoints((old) => old.filter((p) => p.id !== data.id));
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...rest}>
      {points.map((p) => (
        <div
          key={p.id}
          className="relative w-full h-17 lg:h-25 border-secondary border lg:border-3 rounded-xl lg:rounded-3xl flex items-center justify-between"
        >
          {canDeletePoints && (
            <Button
              className="absolute top-0 right-0 translate-x-[30%] -translate-y-[30%] size-8 lg:size-10"
              size="icon"
              variant="destructive"
              onClick={() => handlePointRemoval(p.id)}
            >
              <X />
            </Button>
          )}
          <p className="font-paytone text-xl lg:text-4xl ml-3 lg:ml-5 w-20 lg:w-40">
            {p.amount >= 0 && "+ "}
            {p.amount}
          </p>
          <div className="w-full flex flex-col gap-1 lg:gap-2">
            <p className="font-paytone text-lg lg:text-3xl leading-none">{p.name}</p>
            {p.tags.length > 0 && (
              <div className="flex gap-2">
                {p.tags.map((tag) => (
                  <p
                    key={tag.tagId}
                    className="w-fit rounded-full px-2 lg:px-3 font-paytone pb-1 text-sm lg:text-base"
                    style={{
                      backgroundColor: tag.tag.color,
                      color: tag.tag.textColor,
                    }}
                  >
                    {tag.tag.name}
                  </p>
                ))}
              </div>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="absolute bottom-1 right-2 lg:right-5 text-sm lg:text-xl cursor-default">
                {p.createdAt.toLocaleDateString("fr-FR", { timeZone: "UTC" })}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm lg:text-lg">
                {p.createdAt.toLocaleTimeString("fr-FR", { timeZone: "UTC" })}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      ))}
    </div>
  );
};

export { PointsList };
