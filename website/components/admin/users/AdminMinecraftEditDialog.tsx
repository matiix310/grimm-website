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
import { useForm } from "@tanstack/react-form";
import React from "react";
import z from "zod";

const formSchema = z.object({
  username: z.string().refine((name) => name.replaceAll(" ", "").length > 0, {
    error: "Ne dois pas être vide",
  }),
});

type AdminMinecraftEditDialogProps = { userLogin?: string } & React.ComponentProps<
  typeof Dialog
>;

const AdminMinecraftEditDialog = ({
  userLogin,
  open,
  onOpenChange,
}: AdminMinecraftEditDialogProps) => {
  const [loading, setLoading] = React.useState(false);
  const [minecraftUsername, setMinecraftUsername] = React.useState<string>();

  const form = useForm({
    defaultState: {
      values: {
        username: minecraftUsername ?? "Loading...",
      },
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (loading || !userLogin) return;
      setLoading(true);

      const res = await fetch(`/api/users/${userLogin}/minecraft/link`, {
        method: "POST",
        body: JSON.stringify({
          username: value.username,
        }),
      });

      setLoading(false);

      if (res.status !== 200)
        throw new Error("Error while updating the minecraft username");

      const json = await res.json();

      if (json.error) throw new Error(json.message);

      if (onOpenChange) onOpenChange(false);
    },
  });

  React.useEffect(() => {
    if (!userLogin) return;

    // fetch the pseudo
    fetch(`/api/users/${userLogin}/minecraft/link`).then(async (res) => {
      if (res.status !== 200)
        throw new Error("Error while fetching the minecraft username");

      const json = await res.json();

      if (json.error && !json.message.includes("not linked"))
        throw new Error(json.message);

      setMinecraftUsername(json.data?.username ?? "");
    });
  }, [userLogin]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Définir le pseudo Minecraft</DialogTitle>
          <DialogDescription>
            Les points ne seront pas tranférer vers le nouveau compte, c&apos;est à vous
            de les supprimer / ajouter une fois la modification éffectuée
          </DialogDescription>
        </DialogHeader>
        <form
          id="update-minecraft-username-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="username"
              // eslint-disable-next-line react/no-children-prop
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Pseudo minecraft</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      disabled={minecraftUsername === undefined}
                      placeholder="Jeb_"
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
          <Button type="submit" form="update-minecraft-username-form" disabled={loading}>
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AdminMinecraftEditDialog };
