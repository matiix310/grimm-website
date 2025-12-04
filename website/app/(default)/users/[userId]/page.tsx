import DiscordIcon from "@/components/icons/DiscordIcon";
import ForgeIcon from "@/components/icons/ForgeIcon";
import MinecraftIcon from "@/components/icons/MinecraftIcon";
import { AddSocialButton } from "@/components/users/AddSocialButton";
import { UserProfilePicture } from "@/components/users/UserProfilePicture";
import { db } from "@/db";
import { minecraftUsernames } from "@/db/schema/minecraftUsernames";
import { ranking } from "@/db/schema/ranking";
import { auth, Roles } from "@/lib/auth";
import { rolesMetadata } from "@/lib/permissions";
import { eq } from "drizzle-orm";
import { GlobeIcon, Plus } from "lucide-react";
import { headers as nextHeaders } from "next/headers";

const UserPage = async ({ params }: PageProps<"/users/[userId]">) => {
  const userId = (await params).userId;

  const headers = await nextHeaders();
  const session = await auth.api.getSession({
    headers,
  });

  const user =
    userId === "me"
      ? session?.user
      : await db.query.user.findFirst({
          where: (user, { eq }) => eq(user.login, userId),
        });

  if (!user) return <h1>User not found</h1>;

  const external = user.username !== null;

  const roles = (
    (user.role?.split(",").filter((r) => r !== "user") ?? []) as Roles[]
  ).toSorted((a, b) => rolesMetadata[b].priority - rolesMetadata[a].priority);

  const owner = session?.user.id === user.id;

  const accounts = owner
    ? await auth.api.listUserAccounts({ headers }).catch(() => [])
    : [];

  let minecraftAccount: string | undefined = undefined;
  let discordAccount: string | undefined = undefined;

  if (owner) {
    minecraftAccount = (
      await db.query.minecraftUsernames.findFirst({
        where: eq(minecraftUsernames.userId, user.id),
        columns: {
          username: true,
        },
      })
    )?.username;

    const discordAccountId = accounts.find((a) => a.providerId === "discord")?.accountId;
    if (discordAccountId) {
      discordAccount =
        (
          await auth.api.accountInfo({
            query: {
              accountId: discordAccountId,
            },
            headers,
          })
        )?.user.name ?? "unknown";
    }
  }

  const season1 = await db.query.ranking.findFirst({
    where: eq(ranking.userId, user.id),
  });

  return (
    <div className="flex flex-col w-full px-5 lg:px-12 xl:px-20 pt-12 lg:pt-8 xl:pt-12 gap-8 lg:gap-8 xl:gap-12">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 xl:gap-12 items-center">
        <UserProfilePicture
          className="w-[80%] lg:w-50 xl:w-70"
          src={user.image ?? "/grimm-logo-round.svg"}
        />
        <div className="flex flex-col w-full justify-center gap-2 lg:gap-1 xl:gap-2">
          <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
            <p className="text-5xl lg:text-5xl xl:text-6xl">{user.name}</p>
            <div className="flex flex-row gap-2">
              {roles.map((r) => (
                <p
                  key={r}
                  className="text-xl lg:text-xl xl:text-2xl px-3 lg:px-3 xl:px-4 py-1 lg:py-1 xl:py-2 rounded-full w-fit"
                  style={{
                    backgroundColor: rolesMetadata[r].backgroundColor,
                    color: rolesMetadata[r].foregroundColor,
                  }}
                >
                  {rolesMetadata[r].displayName}
                </p>
              ))}
            </div>
          </div>
          <div className="flex gap-1 lg:gap-1 xl:gap-2 items-center">
            <div className="aspect-square w-7 lg:w-7 xl:w-8 opacity-80">
              {external ? (
                <GlobeIcon className="size-full" />
              ) : (
                <ForgeIcon className="size-full" />
              )}
            </div>
            <p className="text-3xl lg:text-3xl xl:text-4xl opacity-80">{user.login}</p>
          </div>
          <p className="text-3xl lg:text-3xl xl:text-4xl opacity-80">
            Inscrit depuis le {user.createdAt.toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
      {owner && (
        <div className="flex flex-col gap-5 lg:gap-5 xl:gap-8">
          <div className="flex flex-col lg:flex-row lg:gap-4 lg:items-center">
            <h1 className="font-paytone text-5xl lg:text-5xl xl:text-6xl">
              Mes connexions
            </h1>
            <AddSocialButton
              state={{ discord: !!discordAccount, minecraft: !!minecraftAccount }}
            >
              <p>Ajouter</p> <Plus className="mt-1" />
            </AddSocialButton>
          </div>
          <div className="flex flex-col gap-2">
            {minecraftAccount !== undefined && (
              <div className="flex gap-2 items-center">
                <div className="aspect-square w-8 lg:w-8 xl:w-10 p-2 rounded-lg bg-secondary fill-secondary-foreground">
                  <MinecraftIcon />
                </div>
                <p className="text-2xl lg:text-2xl xl:text-3xl">{minecraftAccount}</p>
              </div>
            )}
            {discordAccount !== undefined && (
              <div className="flex gap-2 items-center">
                <div className="aspect-square w-8 lg:w-8 xl:w-10 p-2 rounded-lg bg-secondary fill-secondary-foreground">
                  <DiscordIcon />
                </div>
                <p className="text-2xl lg:text-2xl xl:text-3xl">{discordAccount}</p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-5 lg:gap-5 xl:gap-8">
        <h1 className="font-paytone text-5xl lg:text-5xl xl:text-6xl">Recap</h1>
        <div className="flex flex-col gap-2">
          {season1 && (
            <p className="text-2xl lg:text-2xl xl:text-3xl">
              Tome I, le commencement (#{season1.rank} avec {season1.points} point
              {Math.abs(season1.points) > 1 ? "s" : ""})
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
