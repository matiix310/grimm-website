import Image from "next/image";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { User } from "lucide-react";

type NavbarProps = {} & React.ComponentProps<"div">;

const Navbar = async ({ className, ...rest }: NavbarProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div
      className={cn("flex items-center justify-between py-4 px-8", className)}
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
      <div className="flex gap-5">
        <Link href="/#bureau">
          <Button size="lg" variant="secondary">
            Le Bureau
          </Button>
        </Link>
        <Link href="/#events">
          <Button size="lg" variant="secondary">
            Les Events
          </Button>
        </Link>
        {session ? (
          <>
            <Link href="/users/me">
              <Button size="lg" variant="primary">
                <User />
                {session.user.name}
              </Button>
            </Link>
            <Link href="/logout">
              <Button size="lg" variant="destructive">
                Se Deconnecter
              </Button>
            </Link>
          </>
        ) : (
          <Link href="/login">
            <Button size="lg" variant="primary">
              Se Connecter
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export { Navbar };
