import { MinecraftLinkCard } from "@/components/minecraft/MinecraftLinkCard";
import { db } from "@/db";
import { minecraftUsernames } from "@/db/schema/minecraftUsernames";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const MinecraftLinkPage = async (props: PageProps<"/minecraft/link">) => {
  // only logged users can access this page
  const user = await auth.api.getSession({
    headers: await headers(),
  });

  const query = await props.searchParams;
  const username = query["username"];

  if (!user)
    return redirect(
      "/login?redirect=/minecraft/link" + (username ? "?username=" + username : "")
    );

  // check if the user is already linked with another account
  const dbUser = await db.query.minecraftUsernames.findFirst({
    where: eq(minecraftUsernames.userId, user.user.id),
  });

  if (dbUser) return redirect("/");

  // TODO: error page?
  if (username === undefined || typeof username !== "string") return redirect("/");

  return <MinecraftLinkCard userLogin={user.user.login} username={username} />;
};

export default MinecraftLinkPage;
