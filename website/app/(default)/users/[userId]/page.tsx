import { AddPointButton } from "@/components/users/AddPointButton";
import { PointsList } from "@/components/users/PointsList";
import { db } from "@/db";
import { points as pointsSchema } from "@/db/schema/points";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/utils/auth";
import { desc } from "drizzle-orm";
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

  const points = await db.query.points.findMany({
    where: (points, { eq }) => eq(points.userId, user.id),
    with: {
      tags: {
        with: {
          tag: true,
        },
      },
    },
    orderBy: [desc(pointsSchema.createdAt)],
  });

  const canAddPoints = await hasPermission({ headers, permissions: { points: ["add"] } });
  const canDeletePoints = await hasPermission({
    headers,
    permissions: { points: ["delete"] },
  });

  const availableTags = canAddPoints ? await db.query.pointTags.findMany() : [];

  return (
    <div className="flex flex-col lg:flex-row gap-2 lg:gap-30 mt-2 lg:mt-5 mx-5 lg:mx-30 items-center">
      <div className="relative w-[70vw] lg:w-100 h-fit">
        <svg className="w-full aspect-square">
          <circle cx="50%" cy="50%" r="50%" fill="#FEF3DA" />
        </svg>
        {user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="absolute right-3 lg:right-5 top-[50%] -translate-y-[50%] rounded-full w-[80%]"
            alt="Image de profil"
            src={user.image}
          />
        )}
      </div>
      <div className="flex-1 w-full">
        <div className="flex flex-col gap-5 lg:gap-10">
          <div className="flex flex-col gap-2">
            <h1 className="font-paytone text-4xl lg:text-7xl">{user.name}</h1>
            <div className="flex gap-2 lg:gap-5">
              <p className="font-paytone text-xl lg:text-3xl">
                {points.reduce((sum, point) => sum + point.amount, 0)} points
              </p>
              {canAddPoints && (
                <AddPointButton availableTags={availableTags} userLogin={user.login} />
              )}
            </div>
          </div>
          <PointsList
            defaultPoints={points}
            canDeletePoints={canDeletePoints}
            userLogin={user.login}
          />
        </div>
      </div>
    </div>
  );
};

export default UserPage;
