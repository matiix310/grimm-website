import { MinecraftLinkCard } from "@/components/minecraft/MinecraftLinkCard";
import { db } from "@/db";
import { minecraftUsernames } from "@/db/schema/minecraftUsernames";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const MinecraftLinkPage = async (
  props: PageProps<"/minecraft/[minecraftUsername]/link">
) => {
  // only logged users can access this page
  const user = await auth.api.getSession({
    headers: await headers(),
  });

  const params = await props.params;

  const linkRedirectPath = encodeURIComponent(
    `/minecraft/${params.minecraftUsername}/link`
  );

  if (!user) return redirect(`/login?redirect=${linkRedirectPath}`);

  // check if the user is already linked with another account
  const dbUser = await db.query.minecraftUsernames.findFirst({
    where: eq(minecraftUsernames.userId, user.user.id),
  });

  if (dbUser) return redirect("/");

  return (
    <MinecraftLinkCard userLogin={user.user.login} username={params.minecraftUsername} />
  );
};

export default MinecraftLinkPage;
