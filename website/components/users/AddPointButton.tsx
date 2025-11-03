"use client";

import z from "zod";
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
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/Field";
import { Input } from "../ui/Input";
import { PointTags } from "@/db/schema/pointTags";
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { Plus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/Command";
import { $fetch } from "@/lib/betterFetch";

const formSchema = z.object({
  name: z.string().refine((name) => name.replaceAll(" ", "").length > 0, {
    error: "Ne dois pas être vide",
  }),
  amount: z
    .string()
    .regex(/^\-?[0-9]+$/, { error: "Dois être de la forme: /^\\-?[0-9]+$/" })
    .refine((amount) => !isNaN(parseInt(amount)), { error: "Nombre invalide" }),
  tags: z.array(z.string()),
});

type AddPointButtonProps = {
  availableTags: PointTags[];
  userLogin: string;
};

const AddPointButton = ({ availableTags, userLogin }: AddPointButtonProps) => {
  const form = useForm({
    defaultValues: {
      name: "",
      amount: "",
      tags: [] as string[],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (loading) return;
      setLoading(true);

      const { error } = await $fetch("@put/api/users/:id/points", {
        params: { id: userLogin },
        body: { ...value, amount: parseInt(value.amount) },
      });

      setLoading(false);

      if (error) throw new Error(error.message);

      window.location.reload();
    },
  });

  const [tagSelectOpen, setTagSelectOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const tagFromId = React.useCallback(
    (tagId: string) => {
      return availableTags.find((t) => t.id === tagId);
    },
    [availableTags]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Ajouter</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter des points</DialogTitle>
          <DialogDescription>
            Vous pouvez entrer une valeur négative pour retirer des points
          </DialogDescription>
        </DialogHeader>
        <form
          id="add-points-form"
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
                      placeholder="Concours de dessin"
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="amount"
              // eslint-disable-next-line react/no-children-prop
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Quantité (nombre entier)</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="42"
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="tags"
              // eslint-disable-next-line react/no-children-prop
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                    <div className="flex items-center gap-2">
                      {field.state.value.length === 0 && <p>Aucun tag séléctioné</p>}
                      {field.state.value.map((tagId) => {
                        const tag = tagFromId(tagId)!;
                        return (
                          <p
                            key={tag.id}
                            className="rounded-full px-2 py-0.5 cursor-pointer border-2 border-transparent hover:border-background"
                            style={{
                              backgroundColor: tag.color,
                              color: tag.textColor,
                            }}
                            onClick={() =>
                              field.handleChange((old) =>
                                old.filter((oId) => oId !== tagId)
                              )
                            }
                          >
                            {tag.name}
                          </p>
                        );
                      })}
                      <Popover open={tagSelectOpen} onOpenChange={setTagSelectOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="secondary" size="icon" className="size-8">
                            <Plus size={20} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Rechercher un tag..." />
                            <CommandList>
                              <CommandEmpty>Aucun tags disponible</CommandEmpty>
                              <CommandGroup>
                                {availableTags
                                  .filter((t) => !field.state.value.includes(t.id))
                                  .map((tag) => {
                                    return (
                                      <CommandItem
                                        className="cursor-pointer"
                                        style={
                                          {
                                            "--accent": tag.color,
                                            "--on-accent": tag.textColor,
                                          } as Record<string, string>
                                        }
                                        key={tag.id}
                                        value={tag.name}
                                        onSelect={() => {
                                          field.handleChange((old) => [...old, tag.id]);
                                          setTagSelectOpen(false);
                                        }}
                                      >
                                        {tag.name}
                                      </CommandItem>
                                    );
                                  })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
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
          <Button type="submit" form="add-points-form" disabled={loading}>
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AddPointButton };
