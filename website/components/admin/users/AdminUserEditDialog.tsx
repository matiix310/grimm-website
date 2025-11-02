"use client";

import { Button } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { $fetch, ApiSchema } from "@/lib/betterFetch";
import { rolesMetadata } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useForm } from "@tanstack/react-form";
import { Check, ChevronsUpDown } from "lucide-react";
import React from "react";
import z from "zod";

const formSchema = z.object({
  name: z.string().refine((name) => name.replaceAll(" ", "").length > 0, {
    error: "Ne dois pas être vide",
  }),
  role: z.string(),
});

type AdminUserEditDialogProps = {
  userLogin?: string;
  onUpdateUser: (user: ApiSchema["@post/api/users/:id"]["output"]["user"]) => unknown;
} & React.ComponentProps<typeof Dialog>;

const AdminUserEditDialog = ({
  userLogin,
  onUpdateUser,
  open,
  onOpenChange,
}: AdminUserEditDialogProps) => {
  const [loading, setLoading] = React.useState(false);
  const [user, setUser] = React.useState<ApiSchema["/api/users/:id"]["output"]>();
  const [roleOpen, setRoleOpen] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      role: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (loading || !userLogin) return;

      const name = value.name === user!.user.name ? undefined : value.name;
      const role =
        value.role === user!.user.role
          ? undefined
          : (value.role as keyof typeof rolesMetadata);

      if (!name && !role) return;

      setLoading(true);

      const { data, error } = await $fetch("@post/api/users/:id", {
        params: { id: userLogin },
        body: {
          name,
          role,
        },
      });

      setLoading(false);

      if (error) throw new Error(error.message);
      onUpdateUser(data.user);
      if (onOpenChange) onOpenChange(false);
    },
  });

  React.useEffect(() => {
    if (!userLogin) return;

    // fetch the user
    $fetch("/api/users/:id", {
      params: {
        id: userLogin,
      },
    }).then(({ data, error }) => {
      if (error) throw new Error(error.message);
      setUser(data);
      form.setFieldValue("name", data.user.name);
      form.setFieldValue("role", data.user.role as string);
    });
  }, [userLogin, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;utilisateur</DialogTitle>
          <DialogDescription>J&apos;ai plus d&apos;inspi la</DialogDescription>
        </DialogHeader>
        <form
          id="update-user-form"
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
                      disabled={user === undefined}
                      placeholder="Xavier Login"
                      autoComplete="off"
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <form.Field
              name="role"
              // eslint-disable-next-line react/no-children-prop
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                    <Popover open={roleOpen} onOpenChange={setRoleOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          aria-invalid={isInvalid}
                          disabled={user === undefined}
                          variant="outline"
                          role="combobox"
                          aria-expanded={roleOpen}
                          className="w-[200px]! justify-between font-archivo"
                        >
                          {field.state.value}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Chercher un role..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>Aucun role trouvé</CommandEmpty>
                            <CommandGroup>
                              {user?.canGiveRoles?.map((roleName) => (
                                <CommandItem
                                  key={roleName}
                                  value={roleName}
                                  onSelect={(currentValue) => {
                                    field.handleChange(currentValue);
                                    setRoleOpen(false);
                                  }}
                                >
                                  {roleName}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      field.state.value === roleName
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
          <Button type="submit" form="update-user-form" disabled={loading}>
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AdminUserEditDialog };
