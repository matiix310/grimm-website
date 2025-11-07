import { MinecraftAuthorizeCard } from "@/components/minecraft/MinecraftAuthorizeCard";
import { db } from "@/db";
import { minecraftUsernames } from "@/db/schema/minecraftUsernames";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const MinecraftAuthorize = async (
  props: PageProps<"/minecraft/[minecraftUsername]/authorize">
) => {
  const params = await props.params;

  const authorizeRedirectPath = encodeURIComponent(
    `/minecraft/${params.minecraftUsername}/authorize`
  );

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect(`/login?redirect=${authorizeRedirectPath}`);

  const minecraftUsername = await db.query.minecraftUsernames.findFirst({
    where: eq(minecraftUsernames.userId, session.user.id),
  });

  if (minecraftUsername === undefined)
    return redirect(
      `/minecraft/${params.minecraftUsername}/link?redirect=${authorizeRedirectPath}`
    );

  if (minecraftUsername.username !== params.minecraftUsername)
    // TODO: error page
    return redirect("/");

  return <MinecraftAuthorizeCard username={minecraftUsername.username} />;
};

export default MinecraftAuthorize;
