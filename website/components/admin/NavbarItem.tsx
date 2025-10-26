import { cn } from "@/lib/utils";

type NavbarItemProps = { selected: boolean } & React.ComponentProps<"h1">;

const NavbarItem = ({ selected, className, ...rest }: NavbarItemProps) => {
  return (
    <h1
      className={cn(
        "text-foreground flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium whitespace-nowrap",
        selected ? "bg-background " : "",
        className
      )}
      {...rest}
    />
  );
};

export { NavbarItem };
