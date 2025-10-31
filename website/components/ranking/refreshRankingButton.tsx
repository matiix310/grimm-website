"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

type RefreshRankingButtonProps = {} & React.ComponentProps<typeof Button>;

const RefreshRankingButton = ({ className, ...rest }: RefreshRankingButtonProps) => {
  const [loading, setLoading] = React.useState(false);

  const handleRefresh = () => {
    setLoading(true);
    fetch("/api/ranking/refresh").then(async (res) => {
      setLoading(false);

      if (res.status !== 200) throw new Error("Error while refreshing the ranking");

      const json = await res.json();

      if (json.error) throw new Error(json.message);

      window.location.reload();
    });
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
