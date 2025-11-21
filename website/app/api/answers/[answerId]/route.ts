import { db } from "@/db";
import { answers } from "@/db/schema/answers";
import { answerUsers } from "@/db/schema/answerUsers";
import { points } from "@/db/schema/points";
import ApiResponse from "@/lib/apiResponse";
import { auth } from "@/lib/auth";
import { rateLimiter } from "@/lib/rateLimiter";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import z from "zod";

const sanitizeAnswer = (answer: string) => {
  return answer
    .replaceAll(" ", "")
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const POST = async (
  request: NextRequest,
  ctx: RouteContext<"/api/answers/[answerId]">
) => {
  if (process.env.DISABLE_EDIT_POINTS)
    return ApiResponse.unauthorized("Point system is currently disabled for editing");

  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) return ApiResponse.unauthorized();

  // check the rate limit
  if (rateLimiter.isLimited("answer", session.user.id)) return ApiResponse.unauthorized();
  rateLimiter.limit("answer", session.user.id, 2000);

  const params = await ctx.params;
  const answerId = params.answerId;

  const json = await request.json().catch(() => null);

  if (json === null) return ApiResponse.badRequestBodyParsing();

  const parsed = z.object({ answer: z.string().nonempty() }).safeParse(json);

  if (parsed.error) return ApiResponse.badRequestBodyValidation(parsed.error.issues);

  // get the expected answer
  const expected = await db.query.answers.findFirst({
    where: eq(answers.id, answerId),
    with: {
      users: { columns: { userId: true } },
    },
  });

  if (expected === undefined) return ApiResponse.notFound("Answer not found");

  if (expected.users.find((u) => u.userId === session.user.id))
    return ApiResponse.unauthorized("You already answered this question");

  // check the answer
  const expectedAnswer = sanitizeAnswer(expected.answer);
  const actualAnswer = sanitizeAnswer(parsed.data.answer);

  if (expectedAnswer !== actualAnswer) return ApiResponse.json({ success: false });

  // correct answer, add the points
  await Promise.all([
    db.insert(points).values({
      userId: session.user.id,
      name: expected.name,
      amount: expected.points,
    }),
    db.insert(answerUsers).values({
      userId: session.user.id,
      answerId: expected.id,
    }),
  ]);

  return ApiResponse.json({ success: true });
};
