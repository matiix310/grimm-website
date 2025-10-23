import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "rounded-full flex justify-center items-center cursor-pointer transition-all ease-in-out",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      size: {
        default: "px-9 py-5 text-2xl",
        sm: "px-3",
        lg: "px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

type ButtonProps = VariantProps<typeof buttonVariants> & React.ComponentProps<"div">;

const Button = ({ variant, size, className, ...rest }: ButtonProps) => {
  return <div className={cn(buttonVariants({ variant, size, className }))} {...rest} />;
};

export { Button };
