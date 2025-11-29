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
import { useForm } from "@tanstack/react-form";
import { Plus } from "lucide-react";
import React from "react";
import z from "zod";

const formSchema = z.object({
  name: z.string().refine((name) => name.replaceAll(" ", "").length > 0, {
    error: "Ne dois pas être vide",
  }),
  roles: z.array(
    z.union(
      Object.keys(rolesMetadata).map((r) => z.literal(r as keyof typeof rolesMetadata))
    )
  ),
});

type AdminUserEditDialogProps = {
  userLogin?: string;
  onUpdateUser: (user: ApiSchema["@post/api/users/:id"]["output"]) => unknown;
} & React.ComponentProps<typeof Dialog>;

const AdminUserEditDialog = ({
  userLogin,
  onUpdateUser,
  open,
  onOpenChange,
}: AdminUserEditDialogProps) => {
  const [loading, setLoading] = React.useState(false);
  const [user, setUser] = React.useState<ApiSchema["/api/users/:id"]["output"]>();
  const [rolesOpen, setRolesOpen] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: "" as z.infer<typeof formSchema>["name"],
      roles: [] as z.infer<typeof formSchema>["roles"],
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (loading || !userLogin) return;

      setLoading(true);

      const { data, error } = await $fetch("@post/api/users/:id", {
        params: { id: userLogin },
        body: {
          name: value.name,
          roles: value.roles,
        },
      });

      setLoading(false);

      if (error) throw new Error(error.message);
      onUpdateUser(data);
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
      form.setFieldValue("roles", data.user.roles);
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
              name="roles"
              // eslint-disable-next-line react/no-children-prop
              children={(field) => {
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Roles</FieldLabel>
                    <div className="flex items-center gap-2 flex-wrap">
                      {Object.keys(field.state.value).length === 0 && (
                        <p>Aucun role séléctioné</p>
                      )}
                      {field.state.value.map((r) => (
                        <Button
                          variant="secondary"
                          size="sm"
                          key={r}
                          className="hover:bg-red hover:text-red-foreground"
                          onClick={() =>
                            field.handleChange((old) => old.filter((oldR) => oldR !== r))
                          }
                          disabled={!user?.canEditRoles.includes(r)}
                        >
                          {r}
                        </Button>
                      ))}
                      <Popover modal={true} open={rolesOpen} onOpenChange={setRolesOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="secondary" size="icon" className="size-8">
                            <Plus size={20} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Rechercher un role..." />
                            <CommandList>
                              <CommandEmpty>Aucun role disponible</CommandEmpty>
                              <CommandGroup>
                                {user?.canEditRoles
                                  .filter((r) => !field.state.value.includes(r))
                                  .map((r) => (
                                    <CommandItem
                                      className="cursor-pointer"
                                      key={r}
                                      value={r}
                                      onSelect={() => {
                                        field.handleChange((old) => {
                                          return [...old, r];
                                        });
                                        setRolesOpen(false);
                                      }}
                                    >
                                      {r}
                                    </CommandItem>
                                  ))}
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
          <Button type="submit" form="update-user-form" disabled={loading}>
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { AdminUserEditDialog };
