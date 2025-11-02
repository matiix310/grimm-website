"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";
import { $fetch } from "@/lib/betterFetch";

type RefreshRankingButtonProps = {} & React.ComponentProps<typeof Button>;

const RefreshRankingButton = ({ className, ...rest }: RefreshRankingButtonProps) => {
  const [loading, setLoading] = React.useState(false);

  const handleRefresh = async () => {
    setLoading(true);

    const { error } = await $fetch("/api/ranking/refresh");

    setLoading(false);

    if (error) throw new Error(error.message);

    window.location.reload();
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      disabled={loading}
      onClick={() => handleRefresh()}
      className={cn("", className)}
      {...rest}
    >
      <RefreshCw size={30} className={cn(loading ? "animate-spin" : "")} />
    </Button>
  );
};

export { RefreshRankingButton };
