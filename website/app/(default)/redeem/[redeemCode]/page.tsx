import { db } from "@/db";
import { points } from "@/db/schema/points";
import { redeemCodes } from "@/db/schema/redeemCodes";
import { redeemUsers } from "@/db/schema/redeemUsers";
import { auth } from "@/lib/auth";
import { rateLimiter } from "@/lib/rateLimiter";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const RedeemCodePage = async (props: PageProps<"/redeem/[redeemCode]">) => {
  if (process.env.DISABLE_EDIT_POINTS) return redirect("/");

  // check if the user is logged in
  const user = await auth.api.getSession({ headers: await headers() });

  const params = await props.params;
  const redeemCode = params.redeemCode;

  if (!user) redirect(`/login?redirect=/redeem/${redeemCode}`);

  // check the rate limiter
  if (rateLimiter.isLimited("redeem_code", user.user.id)) return <h1>Too fast</h1>;
  rateLimiter.limit("redeem_code", user.user.id, 2000);

  const code = await db.query.redeemCodes.findFirst({
    where: eq(redeemCodes.code, redeemCode),
    with: {
      users: true,
    },
  });

  if (
    !code ||
    code.users.find((u) => u.userId === user.user.id) ||
    (code.maxUsage && code.maxUsage <= code.users.length)
  )
    return <h1>Code invalide ou déja utilisé</h1>;

  // give the points
  await Promise.all([
    db.insert(points).values({
      userId: user.user.id,
      name: code.name,
      amount: code.points,
    }),
    db.insert(redeemUsers).values({ userId: user.user.id, codeId: code.id }),
  ]);

  return <h1>Vous venez de gagner {code.points} points!</h1>;
};

export default RedeemCodePage;
