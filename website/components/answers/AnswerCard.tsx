"use client";

import React from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { RefreshCw } from "lucide-react";
import { $fetch } from "@/lib/betterFetch";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/Field";
import { Input } from "../ui/Input";
import { toast } from "sonner";

const formSchema = z.object({
  answer: z.string().nonempty(),
});

type AnswerCardProps = {
  answerId: string;
  answerName: string;
};

const AnswerCard = ({ answerId, answerName }: AnswerCardProps) => {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const form = useForm({
    defaultValues: {
      answer: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (loading) return;
      setLoading(true);

      const { data, error } = await $fetch("@post/api/answers/:answerId", {
        params: { answerId },
        body: value,
      });

      setLoading(false);

      if (error) {
        toast.error("Erreur lors de l'envoi de la réponse");
        return;
      }

      if (!data.success) {
        toast.error("La réponse est incorrect");
        return;
      }

      toast.success("La réponse est correct, les points ont été ajouté à votre compte");
      form.reset();
      setSuccess(true);
    },
  });

  return (
    <Card className="absolute top-[50%] left-[50%] -translate-[50%]">
      <h1 className="font-paytone text-3xl">{answerName}</h1>
      <form
        id="answer-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field
            name="answer"
            // eslint-disable-next-line react/no-children-prop
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Réponse</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Soirée des 40 ans d'EPITA"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </FieldGroup>
      </form>
      <Button type="submit" form="answer-form" disabled={loading} size="lg">
        {loading && <RefreshCw className="animate-spin" />}
        Envoyer
      </Button>
    </Card>
  );
};

export { AnswerCard };
