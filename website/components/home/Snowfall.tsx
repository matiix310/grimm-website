"use client";

import { cn } from "@/lib/utils";
import ReactSnowfall from "react-snowfall";

type SnowfallProps = React.ComponentProps<"div">;

const Snowfall = ({ className, ...props }: SnowfallProps) => {
  return (
    <div className={cn("relative", className)} {...props}>
      <ReactSnowfall />;
    </div>
  );
};

export { Snowfall };
