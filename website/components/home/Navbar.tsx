import Image from "next/image";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { User } from "lucide-react";
import { MobileMenu } from "./MobileMenu";

export type MenuButton = {
  name: string;
  variant: "primary" | "secondary" | "destructive";
  link: string;
};

type NavbarProps = {} & React.ComponentProps<"div">;

const Navbar = async ({ className, ...rest }: NavbarProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const buttons: MenuButton[] = [
    {
      name: "Le Classement",
      variant: "secondary",
      link: "/ranking",
    },
    ...(session
      ? ([
          { name: session.user.name, variant: "primary", link: "/users/me" },
          { name: "Se Deconnecter", variant: "destructive", link: "/logout" },
        ] as const)
      : ([{ name: "Se Connecter", variant: "primary", link: "/login" }] as const)),
  ];

  return (
    <div
      className={cn(
        "flex items-center justify-between h-25 min-h-25 px-5 lg:px-8",
        className
      )}
      {...rest}
    >
      <Link href="/">
        <Image
          className="h-[80%] w-auto cursor-pointer"
          src="/grimm.svg"
          alt="Logo Grimm Texte"
          width={100}
          height={100}
          priority
        />
      </Link>
      <div className="gap-5 hidden lg:flex">
        {/* <Link href="/#bureau">
          <Button size="lg" variant="secondary">
            Le Bureau
          </Button>
        </Link>
        <Link href="/#events">
          <Button size="lg" variant="secondary">
            Les Events
          </Button>
        </Link> */}
        {buttons.map((button) => (
          <Link key={button.link} href={button.link}>
            <Button size="lg" variant={button.variant}>
              {button.name}
            </Button>
          </Link>
        ))}
      </div>
      <div className="inline lg:hidden">
        <MobileMenu buttons={buttons} />
      </div>
    </div>
  );
};

export { Navbar };
