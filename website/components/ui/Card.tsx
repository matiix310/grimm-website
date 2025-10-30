import { cn } from "@/lib/utils";
import React from "react";

type CardProps = {} & React.ComponentProps<"div">;

const Card = ({ className, ...rest }: CardProps) => {
  return (
    <div
      className={cn(
        "bg-secondary flex flex-col gap-10 w-150 rounded-4xl p-10 text-secondary-foreground",
        className
      )}
      {...rest}
    />
  );
};

export { Card };
