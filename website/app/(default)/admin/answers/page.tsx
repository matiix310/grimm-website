"use client";

import React from "react";
import { $fetch } from "@/lib/betterFetch";
import { AdminAnswersTable } from "@/components/admin/answers/AdminAnswersTable";
import { AdminAnswerCreateButton } from "@/components/admin/answers/AdminAnswerCreateButton";
import { InferQueryModel } from "@/db";

type Answers = InferQueryModel<
  "answers",
  { users: { columns: { userId: true; createdAt: true } } }
>;

const AnswersPage = () => {
  const [answers, setAnswers] = React.useState<Answers[]>([]);

  React.useEffect(() => {
    $fetch("/api/admin/answers").then(({ data, error }) => {
      if (error) throw new Error(error.message);

      setAnswers(data);
    });
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <AdminAnswerCreateButton
        onNewAnswer={(answer) => setAnswers((old) => [...old, { ...answer, users: [] }])}
      />
      <AdminAnswersTable
        answers={answers}
        onRemoveAnswer={(answer) =>
          setAnswers((old) => old.filter((c) => c.id !== answer))
        }
        onUpdateAnswer={(answer) =>
          setAnswers((old) => [
            ...old.filter((a) => a.id !== answer.id),
            { ...old.find((a) => a.id === answer.id)!, ...answer },
          ])
        }
      />
    </div>
  );
};

export default AnswersPage;
