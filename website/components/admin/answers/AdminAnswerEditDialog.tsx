"use client";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Answers } from "@/db/schema/answers";
import { $fetch } from "@/lib/betterFetch";
import { useForm } from "@tanstack/react-form";
import React from "react";
import z from "zod";

const formSchema = z.object({
  name: z.string().refine((name) => name.replaceAll(" ", "").length > 0, {
    error: "Ne dois pas être vide",
  }),
  answer: z.string().refine((name) => name.replaceAll(" ", "").length > 0, {
    error: "Ne dois pas être vide",
  }),
  points: z.number(),
});

type AdminAnswerEditDialogProps = {
  onEditAnswer: (answer: Answers) => unknown;
  answer?: Answers;
} & React.ComponentProps<typeof Dialog>;

const AdminAnswerEditDialog = ({
  onEditAnswer,
  answer,
  open,
  onOpenChange,
}: AdminAnswerEditDialogProps) => {
  const [loading, setLoading] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      answer: "",
      points: 0,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (loading || !answer) return;
      setLoading(true);

      const { data, error } = await $fetch("@post/api/admin/answers/:answerId", {
        params: {
          answerId: answer.id,
        },
        body: value,
      });

      if (error) throw new Error(error.message);

      onEditAnswer(data);
      setLoading(false);

      if (onOpenChange) onOpenChange(false);
    },
  });

  React.useEffect(() => {
    form.setFieldValue("name", answer?.name ?? "");
    form.setFieldValue("answer", answer?.answer ?? "");
    form.setFieldValue("points", answer?.points ?? 0);
  }, [open, answer, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier une réponse</DialogTitle>
          <DialogDescription>
            Les modifications de réponse n&apos;engendrent aucunes modifications sur les
            points déja récupérés
          </DialogDescription>
        </DialogHeader>
        <form
          id="update-answer-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              // eslint-disable-next-line react/no-children-prop
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nom</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Le grand méchant loup"
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
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
                      placeholder="Un loup"
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="points"
              // eslint-disable-next-line react/no-children-prop
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Points</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      type="number"
                      onChange={(e) => {
                        const num = parseInt(e.target.value);
                        field.handleChange(isNaN(num) ? 0 : num);
                      }}
                      aria-invalid={isInvalid}
                      placeholder="10"
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Annuler</Button>
          </DialogClose>
          <Button type="submit" form="update-answer-form" disabled={loading}>
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AdminAnswerEditDialog };
