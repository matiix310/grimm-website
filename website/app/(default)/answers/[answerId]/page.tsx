import { AnswerCard } from "@/components/answers/AnswerCard";
import { db } from "@/db";
import { answers } from "@/db/schema/answers";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

const AnswersPage = async (props: PageProps<"/answers/[answerId]">) => {
  // check if the user is logged in
  const session = await auth.api.getSession({ headers: await headers() });

  const params = await props.params;

  const answersRedirectPath = encodeURIComponent(`/answers/${params.answerId}`);

  if (!session) redirect(`/login?redirect=${answersRedirectPath}`);

  const answer = await db.query.answers.findFirst({
    where: eq(answers.id, params.answerId),
    with: {
      users: {
        columns: {
          userId: true,
        },
      },
    },
    columns: {
      id: true,
      name: true,
    },
  });

  if (!answer) return redirect("/");

  if (answer.users.find((u) => u.userId === session.user.id))
    return <h1>Vous avez déja répondu à cette question</h1>;

  return <AnswerCard answerId={answer.id} answerName={answer.name} />;
};

export default AnswersPage;
