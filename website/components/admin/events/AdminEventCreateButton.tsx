"use client";

import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
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
import { Label } from "@/components/ui/Label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Textarea } from "@/components/ui/Textarea";
import { Events } from "@/db/schema/events";
import { $fetch } from "@/lib/betterFetch";
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
  image: z.url(),
  date: z.date(),
});

type AdminEventCreateButtonProps = {
  onNewEvent: (event: Events) => unknown;
};

const AdminEventCreateButton = ({ onNewEvent }: AdminEventCreateButtonProps) => {
  const [loading, setLoading] = React.useState(false);
  const [createEventOpen, setCreateEventOpen] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      image: "",
      date: new Date(time + 1000 * 60 * 60 * 24 * 7), // 7j from now
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (loading) return;
      setLoading(true);

      const { data, error } = await $fetch("@put/api/events", { body: value });

      setLoading(false);

      if (error) throw new Error(error.message);

      setCreateEventOpen(false);

      onNewEvent(data);
      form.reset();
    },
  });

  React.useEffect(() => {
    setTime(Date.now());

    // setInterval(() => {
    //   setTime(Date.now());
    // }, 1000);
  }, [form]);

  return (
    <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
      <DialogTrigger asChild>
        <Button className="w-fit">
          <Plus className="pt-0.5" />
          Créer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un évenement</DialogTitle>
          <DialogDescription>
            Les évenements sont affichés sur la page d&apos;accueil du site
          </DialogDescription>
        </DialogHeader>
        <form
          id="create-event-form"
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
                      placeholder="Soirée des 40 ans d'EPITA"
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
                      placeholder="Une soirée inoubliable, [...]."
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
            <form.Field
              name="date"
              // eslint-disable-next-line react/no-children-prop
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <Label htmlFor="date-picker" className="px-1">
                          Jour
                        </Label>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                          <PopoverTrigger asChild>
                            <div
                              id="date-picker"
                              className="cursor-pointer hover:bg-secondary/10 flex items-center h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            >
                              {field.state.value.toLocaleDateString("fr-FR", {
                                timeZone: "UTC",
                              })}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.state.value}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                field.handleChange(
                                  (old) =>
                                    new Date(
                                      date!.toString().split(" ").splice(0, 4).join(" ") +
                                        " " +
                                        old!.toTimeString().split(" ")[0],
                                    ),
                                );
                                setCalendarOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex flex-col">
                        <Label htmlFor="time-picker" className="px-1">
                          Heure
                        </Label>
                        <Input
                          value={field.state.value.toTimeString().split(" ")[0]}
                          onChange={(e) =>
                            field.handleChange(
                              (old) =>
                                new Date(
                                  old.toString().split(" ").splice(0, 4).join(" ") +
                                    " " +
                                    e.target.value,
                                ),
                            )
                          }
                          type="time"
                          id="time-picker"
                          step="1"
                          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                      </div>
                    </div>
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
          <Button type="submit" form="create-event-form" disabled={loading}>
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AdminEventCreateButton };
