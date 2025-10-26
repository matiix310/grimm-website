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
import { authClient } from "@/lib/authClient";
import { useForm } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import React from "react";
import z from "zod";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Label } from "@/components/ui/Label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Calendar } from "@/components/ui/Calendar";
import { toast } from "sonner";

type ApiKey = {
  permissions: {
    [key: string]: string[];
  } | null;
  id: string;
  name: string | null;
  start: string | null;
  prefix: string | null;
  userId: string;
  refillInterval: number | null;
  refillAmount: number | null;
  lastRefillAt: Date | null;
  enabled: boolean;
  rateLimitEnabled: boolean;
  rateLimitTimeWindow: number | null;
  rateLimitMax: number | null;
  requestCount: number;
  remaining: number | null;
  lastRequest: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> | null;
};

const formSchema = z.object({
  name: z.string().refine((name) => name.replaceAll(" ", "").length > 0, {
    error: "Ne dois pas être vide",
  }),
  expirationDate: z.date().min(Date.now(), { error: "La date doit être dans le future" }),
});

const TokensPage = () => {
  const [tokens, setTokens] = React.useState<ApiKey[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [createTokenOpen, setCreateTokenOpen] = React.useState(false);

  React.useEffect(() => {
    authClient.apiKey.list().then((res) => {
      if (res.error) {
        throw new Error(res.error.message);
      }

      setTokens(res.data);
    });
  }, []);

  const form = useForm({
    defaultValues: {
      name: "",
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7j from now
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const { data, error } = await authClient.apiKey.create({
        expiresIn: (value.expirationDate.getTime() - Date.now()) / 1000,
        name: value.name,
      });

      if (error) throw new Error(error.message);

      setCreateTokenOpen(false);

      toast("Click pour copier ta clé API", {
        action: {
          label: "Copy",
          onClick: () => navigator.clipboard.writeText(data.key),
        },
      });

      setTokens((old) => [...old, { ...data, key: undefined }]);
      form.reset();
    },
  });

  const columnHelper = createColumnHelper<ApiKey>();
  const columns: ColumnDef<ApiKey>[] = [
    columnHelper.accessor("name", {
      header: "Nom",
      cell: (test) => test.getValue(),
    }),
    columnHelper.accessor("expiresAt", {
      header: "Expiration",
      cell: (test) => test.getValue()?.toLocaleString() ?? "infinite",
    }),
    columnHelper.accessor("createdAt", {
      header: "Création",
      cell: (test) => test.getValue().toLocaleString(),
    }),
    {
      id: "actions",
      cell: (row) => {
        const apiKeyId = row.row.original.id;
        return (
          <div className="flex items-center justify-end">
            <Button
              variant="destructive"
              size="icon"
              onClick={async () => {
                const { error } = await authClient.apiKey.delete({
                  keyId: apiKeyId,
                });
                if (error) throw new Error(error.message);
                setTokens((old) => old.filter((t) => t.id !== apiKeyId));
              }}
            >
              <Trash2 />
            </Button>
          </div>
        );
      },
    },
  ] as Array<ColumnDef<ApiKey, unknown>>;

  const table = useReactTable({
    data: tokens,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="ml-8 flex flex-col gap-4">
      <Dialog open={createTokenOpen} onOpenChange={setCreateTokenOpen}>
        <DialogTrigger asChild>
          <Button className="w-fit">
            <Plus className="pt-0.5" />
            Créer
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Creer un token</DialogTitle>
            <DialogDescription>Le nom du token doit être explicite</DialogDescription>
          </DialogHeader>
          <form
            id="create-token-form"
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
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
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
                        placeholder="Serveur Minecraft"
                        autoComplete="off"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
              <form.Field
                name="expirationDate"
                // eslint-disable-next-line react/no-children-prop
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Date d&apos;expiration</FieldLabel>
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <Label htmlFor="date-picker" className="px-1">
                            Jour
                          </Label>
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <div
                                id="date-picker"
                                className="cursor-pointer hover:bg-secondary/10 flex items-center h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                              >
                                {field.state.value.toLocaleDateString()}
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
                                        date!
                                          .toString()
                                          .split(" ")
                                          .splice(0, 4)
                                          .join(" ") +
                                          " " +
                                          old!.toTimeString().split(" ")[0]
                                      )
                                  );
                                  setOpen(false);
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
                                      e.target.value
                                  )
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
            <Button type="submit" form="create-token-form" disabled={loading}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucun token
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TokensPage;
