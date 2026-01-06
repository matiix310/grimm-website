import Image from "next/image";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers as nextHeaders } from "next/headers";
import { MobileMenu } from "./MobileMenu";

export type MenuButton = {
  name: string;
  variant: "primary" | "secondary" | "destructive";
  link: string;
};

type NavbarProps = {} & React.ComponentProps<"div">;

const Navbar = async ({ className, ...rest }: NavbarProps) => {
  const headers = await nextHeaders();

  const session = await auth.api.getSession({
    headers,
  });

  const hasAccessToAdminPanel = await auth.api.userHasPermission({
    headers,
    body: {
      permissions: {
        adminPanel: ["access"],
      },
    },
  });

  const buttons: MenuButton[] = [
    ...(hasAccessToAdminPanel
      ? [
          {
            name: "Admin",
            variant: "secondary",
            link: "/admin",
          } as const,
        ]
      : []),
    ...(!process.env.DISABLE_HOWTO_POINTS
      ? ([
          {
            name: "Comment gagner des points?",
            variant: "secondary",
            link: "/howto/points",
          },
        ] as const)
      : []),
    ...(!process.env.DISABLE_RANKING_PAGE
      ? ([
          {
            name: "Le Classement",
            variant: "secondary",
            link: "/ranking",
          },
        ] as const)
      : []),
    ...(session
      ? ([
          { name: "Grimm Pass", variant: "secondary", link: "/pass" },
          { name: session.user.name, variant: "primary", link: "/users/me" },
          { name: "Se Deconnecter", variant: "destructive", link: "/logout" },
        ] as const)
      : ([{ name: "Se Connecter", variant: "primary", link: "/login" }] as const)),
  ];

  return (
    <div
      className={cn(
        "flex items-center justify-between h-20 xl:h-25 min-h-20 xl:min-h-25 px-5 lg:px-8 bg-pink",
        className
      )}
      {...rest}
    >
      <Link href="/" className="relative h-[70%] aspect-[3]">
        <Image
          className="cursor-pointer w-full"
          src="/grimm.svg"
          alt="Logo Grimm Texte"
          fill={true}
          objectPosition="center"
          objectFit="contain"
          priority
        />
      </Link>
      <div className="gap-3 xl:gap-5 hidden lg:flex">
        {buttons.map((button) => (
          <Link key={button.link} href={button.link}>
            <Button
              size="default"
              variant={button.variant}
              className="border-2 xl:border-3 border-background"
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
