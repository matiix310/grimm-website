import Image from "next/image";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
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

  const isAdmin = session?.user.role === "admin";

  const buttons: MenuButton[] = [
    ...(isAdmin
      ? [
          {
            name: "Admin",
            variant: "secondary",
            link: "/admin",
          } as const,
        ]
      : []),
    {
      name: "Les Events",
      variant: "secondary",
      link: "/#events",
    },
    {
      name: "Le Bureau",
      variant: "secondary",
      link: "/#bureau",
    },
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
        "flex items-center justify-between h-25 min-h-25 px-5 lg:px-8 bg-pink",
        className
      )}
      {...rest}
    >
      <Link href="/" className="h-[60%]">
        <Image
          className="cursor-pointer h-full w-auto"
          src="/grimm.svg"
          alt="Logo Grimm Texte"
          width={1000}
          height={1000}
          priority
        />
      </Link>
      <div className="gap-5 hidden lg:flex">
        {buttons.map((button) => (
          <Link key={button.link} href={button.link}>
            <Button
              size="default"
              variant={button.variant}
              className="border-3 border-background"
            >
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
