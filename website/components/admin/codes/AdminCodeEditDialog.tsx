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
import { RedeemCodes } from "@/db/schema/redeemCodes";
import { $fetch } from "@/lib/betterFetch";
import { useForm } from "@tanstack/react-form";
import React from "react";
import z from "zod";

const formSchema = z.object({
  maxUsage: z.number().positive(),
  name: z.string().refine((name) => name.replaceAll(" ", "").length > 0, {
    error: "Ne dois pas être vide",
  }),
  points: z.number(),
});

type AdminCodeEditDialogProps = {
  onEditCode: (code: RedeemCodes) => unknown;
  code?: RedeemCodes;
} & React.ComponentProps<typeof Dialog>;

const AdminCodeEditDialog = ({
  onEditCode,
  code,
  open,
  onOpenChange,
}: AdminCodeEditDialogProps) => {
  const [loading, setLoading] = React.useState(false);

  const form = useForm({
    defaultValues: {
      maxUsage: 0,
      name: "",
      points: 0,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (loading || !code) return;
      setLoading(true);

      const { data, error } = await $fetch("@post/api/admin/codes/:codeId", {
        params: {
          codeId: code.id,
        },
        body: value,
      });

      if (error) throw new Error(error.message);

      onEditCode(data);
      setLoading(false);

      if (onOpenChange) onOpenChange(false);
    },
  });

  React.useEffect(() => {
    form.setFieldValue("maxUsage", code?.maxUsage ?? 0);
    form.setFieldValue("name", code?.name ?? "");
    form.setFieldValue("points", code?.points ?? 0);
  }, [open, code, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier un code</DialogTitle>
          <DialogDescription>
            Les modifications de code n&apos;engendrent aucunes modifications sur les
            points déja récupérés
          </DialogDescription>
        </DialogHeader>
        <form
          id="update-code-form"
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
                      placeholder="Un code peut en cache un autre"
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="maxUsage"
              // eslint-disable-next-line react/no-children-prop
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Utilisations maximums</FieldLabel>
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
                      placeholder="50"
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
          <Button type="submit" form="update-code-form" disabled={loading}>
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AdminCodeEditDialog };
