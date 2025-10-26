"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { redirect, usePathname } from "next/navigation";

type NavbarProps = {
  routes: { name: string; path: string }[];
} & React.ComponentProps<"div">;

const Navbar = ({ routes, className, ...rest }: NavbarProps) => {
  const pathName = usePathname();

  const isActive = React.useCallback(
    (path: string) => pathName.endsWith(path),
    [pathName]
  );

  const [loadingItem, setLoadingItem] = React.useState<string | null>(null);

  const handleClick = (path: string) => {
    setLoadingItem(path);
    redirect(path);
  };

  React.useEffect(() => {
    setLoadingItem(null);
  }, [pathName]);

  return (
    <div
      className={cn("flex gap-2 bg-muted w-fit p-1 rounded-full", className)}
      {...rest}
    >
      {routes.map((r) => (
        <div
          key={r.path}
          className={cn(
            "text-foreground flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium whitespace-nowrap",
            isActive(r.path) && loadingItem === null
              ? "bg-background cursor-default"
              : "cursor-pointer",
            loadingItem === r.path ? "text-muted-foreground pointer-events-none" : ""
          )}
          onClick={() => handleClick(r.path)}
        >
          {loadingItem === r.path && <Loader2 size={15} className="animate-spin" />}
          {r.name}
        </div>
      ))}
    </div>
  );
};

export { Navbar };
