"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "../ui/Button";
import { X } from "lucide-react";
import { InferQueryModel } from "@/db";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/Tooltip";

type PointsListProps = {
  points: InferQueryModel<"points", { tags: { with: { tag: true } } }>[];
  isAdmin: boolean;
  userLogin: string;
} & React.ComponentProps<"div">;

const PointsList = ({
  points,
  isAdmin,
  userLogin,
  className,
  ...rest
}: PointsListProps) => {
  const handlePointRemoval = async (pointId: string) => {
    const res = await fetch(`/api/users/${userLogin}/points`, {
      body: JSON.stringify({
        id: pointId,
      }),
      method: "DELETE",
    });

    const data = await res.json();

    if (res.status !== 200 || data.error) {
      throw new Error("Error removing the points");
    }

    window.location.reload();
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...rest}>
      {points.map((p) => (
        <div
          key={p.id}
          className="relative w-full h-25 border-secondary border-3 rounded-3xl flex items-center justify-between"
        >
          {isAdmin && (
            <Button
              className="absolute top-0 right-0 translate-x-[30%] -translate-y-[30%]"
              size="icon"
              variant="destructive"
              onClick={() => handlePointRemoval(p.id)}
            >
              <X />
            </Button>
          )}
          <p className="font-paytone text-4xl ml-5 w-40">
            {p.amount >= 0 && "+ "}
            {p.amount}
          </p>
          <div className="w-full flex flex-col gap-2">
            <p className="font-paytone text-3xl">{p.name}</p>
            <div className="flex gap-2">
              {p.tags.map((tag) => (
                <p
                  key={tag.tagId}
                  className="w-fit rounded-full px-3 font-paytone pb-1"
                  style={{
                    backgroundColor: tag.tag.color,
                    color: tag.tag.textColor,
                  }}
                >
                  {tag.tag.name}
                </p>
              ))}
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="absolute bottom-1 right-5 text-xl cursor-default">
                {p.createdAt.toLocaleDateString()}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-lg">{p.createdAt.toLocaleTimeString()}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ))}
    </div>
  );
};

export { PointsList };
