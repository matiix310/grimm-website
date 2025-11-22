import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "font-paytone rounded-full flex justify-center items-center cursor-pointer transition-all ease-in-out gap-2 select-none disabled:opacity-70 disabled:cursor-default",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 disabled:hover:bg-primary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:hover:bg-secondary",
        destructive: "bg-red text-red-foreground hover:bg-red/90 disabled:hover:bg-red",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 disabled:hover:bg-accent",
        ghost:
          "bg-transparent text-foreground hover:bg-accent/90 disabled:hover:bg-accent",
        outline:
          "bg-background text-foreground border-1 border-secondary hover:bg-accent/90 disabled:hover:bg-accent", // TODO
        link: "",
      },
      size: {
        lg: "px-8 xl:px-9 py-4 xl:py-5 text-lg xl:text-xl",
        default: "px-4 xl:px-5 py-1 xl:py-2 text-sm xl:text-base pb-2 xl:pb-3",
        sm: "px-3 py-1 text-xs xl:text-sm pb-1.5",
        icon: "size-8 xl:size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

type ButtonProps = VariantProps<typeof buttonVariants> & React.ComponentProps<"button">;

const Button = ({ variant, size, className, ...rest }: ButtonProps) => {
  return (
    <button className={cn(buttonVariants({ variant, size, className }))} {...rest} />
  );
};

export { Button, buttonVariants };
