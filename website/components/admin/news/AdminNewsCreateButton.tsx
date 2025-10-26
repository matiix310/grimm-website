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
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useForm } from "@tanstack/react-form";
import { Plus } from "lucide-react";
import React from "react";
import z from "zod";

const formSchema = z.object({
  name: z.string().refine((name) => name.replaceAll(" ", "").length > 0, {
    error: "Ne dois pas être vide",
  }),
  description: z.string().refine((name) => name.replaceAll(" ", "").length > 0, {
    error: "Ne dois pas être vide",
  }),
});

type AdminNewsCreateButtonProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNewNews: (news: any) => unknown;
};

const AdminNewsCreateButton = ({ onNewNews }: AdminNewsCreateButtonProps) => {
  const [loading, setLoading] = React.useState(false);
  const [createNewsOpen, setCreateNewsOpen] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (loading) return;
      setLoading(true);

      const res = await fetch("/api/news", {
        method: "PUT",
        body: JSON.stringify(value),
      });

      setLoading(false);

      if (res.status !== 200) throw new Error("Error while creating the news");

      const json = await res.json();

      if (json.error) throw new Error(json.message);

      setCreateNewsOpen(false);

      onNewNews(json.data);
      form.reset();
    },
  });

  return (
    <Dialog open={createNewsOpen} onOpenChange={setCreateNewsOpen}>
      <DialogTrigger asChild>
        <Button className="w-fit">
          <Plus className="pt-0.5" />
          Créer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer une actualité</DialogTitle>
          <DialogDescription>
            Les actualités sont affichées dans le premier carousel du site
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-news-form"
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
                      placeholder="Halloween approche ! Booouuuuh"
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="description"
              // eslint-disable-next-line react/no-children-prop
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Une description qui accompagne le titre"
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
          <Button type="submit" form="create-news-form" disabled={loading}>
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AdminNewsCreateButton };
