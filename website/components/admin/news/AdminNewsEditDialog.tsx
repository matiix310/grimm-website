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
import { Textarea } from "@/components/ui/Textarea";
import { News } from "@/db/schema/news";
import { $fetch } from "@/lib/betterFetch";
import { useForm } from "@tanstack/react-form";
import React from "react";
import z from "zod";

const formSchema = z.object({
  name: z.string().refine((name) => name.replaceAll(" ", "").length > 0, {
    error: "Ne dois pas être vide",
  }),
  description: z.string().refine((name) => name.replaceAll(" ", "").length > 0, {
    error: "Ne dois pas être vide",
  }),
  image: z.url(),
});

type AdminNewsEditDialogProps = {
  onEditNews: (news: News) => unknown;
  news?: News;
} & React.ComponentProps<typeof Dialog>;

const AdminNewsEditDialog = ({
  onEditNews,
  news,
  open,
  onOpenChange,
}: AdminNewsEditDialogProps) => {
  const [loading, setLoading] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      image: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (loading || !news) return;
      setLoading(true);

      const { data, error } = await $fetch("@post/api/news/:newsId", {
        params: {
          newsId: news.id,
        },
        body: {
          name: value.name,
          description: value.description,
          image: value.image,
        },
      });

      if (error) throw new Error(error.message);

      onEditNews(data);
      setLoading(false);

      if (onOpenChange) onOpenChange(false);
    },
  });

  React.useEffect(() => {
    form.setFieldValue("name", news?.name ?? "");
    form.setFieldValue("description", news?.description ?? "");
    form.setFieldValue("image", news?.image ?? "");
  }, [open, news, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier une actualité</DialogTitle>
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
                    <Textarea
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
            <form.Field
              name="image"
              // eslint-disable-next-line react/no-children-prop
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Image</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="https://bde-grimm.com/image.png"
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
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AdminNewsEditDialog };
