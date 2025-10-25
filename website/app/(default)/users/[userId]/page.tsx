import { AddPointButton } from "@/components/users/AddPointButton";
import { PointsList } from "@/components/users/PointsList";
import { db } from "@/db";
import { points as pointsSchema } from "@/db/schema/points";
import { auth } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { headers } from "next/headers";

const UserPage = async ({ params }: PageProps<"/users/[userId]">) => {
  const userId = (await params).userId;
  const session = await auth.api.getSession({
    headers: await headers(),
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

  const isAdmin = session?.user.role === "admin";

  const availableTags = isAdmin ? await db.query.pointTags.findMany() : [];

  return (
    <div className="flex gap-30 mt-10 mx-30">
      <div className="relative w-100 h-fit">
        <svg className="w-full aspect-square">
          <circle cx="50%" cy="50%" r="50%" fill="#FEF3DA" />
        </svg>
        {user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="absolute right-5 top-[50%] -translate-y-[50%] rounded-full w-[80%]"
            alt="Image de profil"
            src={user.image}
          />
        )}
      </div>
      <div className="flex-1">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <h1 className="font-paytone text-7xl">{user.name}</h1>
            <div className="flex gap-5">
              <p className="font-paytone text-3xl">
                {points.reduce((sum, point) => sum + point.amount, 0)} points
              </p>
              {isAdmin && (
                <AddPointButton availableTags={availableTags} userLogin={user.login} />
              )}
            </div>
          </div>
          <PointsList points={points} isAdmin={isAdmin} userLogin={user.login} />
        </div>
      </div>
    </div>
  );
};

export default UserPage;
