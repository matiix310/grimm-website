import Link from "next/link";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

type SocialButtonProps = {
  icon: React.ReactNode;
  name: string;
} & React.ComponentProps<typeof Link>;

const SocialButton = ({ icon, name, className, ...rest }: SocialButtonProps) => {
  return (
    <Link target="_blank" className={cn("w-full", className)} {...rest}>
      <Button
        variant="secondary"
        size="lg"
        className="w-full rounded-2xl justify-between font-archivo text-3xl! xl:text-4xl!"
      >
        {icon}
        <span className="w-full text-center">{name}</span>
      </Button>
    </Link>
  );
};

export { SocialButton };
