import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "font-paytone rounded-full flex justify-center items-center cursor-pointer transition-all ease-in-out gap-2 select-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive: "bg-red text-red-foreground hover:bg-red/90",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        ghost: "bg-transparent text-foreground hover:bg-accent/90",
        outline: "bg-accent text-accent-foreground hover:bg-accent/90", // TODO
      },
      size: {
        lg: "px-9 py-5 text-xl",
        default: "px-5 py-2 text-md pb-3",
        sm: "px-3 text-sm pb-0.5",
        icon: "size-10",
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
