import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import { $fetch } from "@/lib/betterFetch";
import { AdminAnswerEditDialog } from "./AdminAnswerEditDialog";
import { InferQueryModel } from "@/db";
import { Answers as AnswersSchema } from "@/db/schema/answers";
import { AdminQrCodeDialog } from "./AdminQrCodeDialog";

type Answers = InferQueryModel<
  "answers",
  { users: { columns: { userId: true; createdAt: true } } }
>;

type AdminAnswersTableProps = {
  answers: Answers[];
  onRemoveAnswer: (answer: string) => unknown;
  onUpdateAnswer: (answer: AnswersSchema) => unknown;
};

const AdminAnswersTable = ({
  answers,
  onRemoveAnswer,
  onUpdateAnswer,
}: AdminAnswersTableProps) => {
  const [editValues, setEditValues] = React.useState<Answers>();
  const [shownAnswer, setShownAnswer] = React.useState<Answers>();

  const columnHelper = createColumnHelper<Answers>();
  const columns: ColumnDef<Answers>[] = [
    columnHelper.accessor("name", {
      header: "Nom",
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("points", {
      header: "Points",
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("users", {
      header: "Nombre de réponse",
      cell: (row) => row.getValue().length,
    }),
    columnHelper.accessor("createdAt", {
      header: "Date de création",
      cell: (row) => row.getValue()?.toLocaleString() ?? "infinite",
    }),
    columnHelper.accessor("updatedAt", {
      header: "Dernière modification",
      cell: (row) => row.getValue()?.toLocaleString() ?? "infinite",
    }),
    {
      id: "actions",
      cell: (row) => {
        const answer = row.row.original;

        const handleShow = () => {
          setShownAnswer(answer);
        };

        const handleEdit = async () => {
          setEditValues(answer);
        };

        const handleCopy = () => {
          navigator.clipboard.writeText(`${window.location.origin}/answers/${answer.id}`);
        };

        const handleDelete = async () => {
          const { data, error } = await $fetch("@delete/api/admin/answers/:answerId", {
            params: { answerId: answer.id },
          });

          if (error) throw new Error(error.message);

          onRemoveAnswer(data.id);
        };

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ouvrir le menu de cet réponse</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShow()}>
                  Afficher le QrCode
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopy()}>Copier</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit()}>Modifier</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => handleDelete()}>
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ] as Array<ColumnDef<Answers, unknown>>;

  const table = useReactTable({
    data: answers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <AdminQrCodeDialog
        open={!!shownAnswer}
        onOpenChange={(open) => {
          if (!open) setShownAnswer(undefined);
        }}
        answer={shownAnswer}
      />
      <AdminAnswerEditDialog
        open={!!editValues}
        onOpenChange={(open) => {
          if (!open) setEditValues(undefined);
        }}
        answer={editValues}
        onEditAnswer={onUpdateAnswer}
      />
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
                  Aucun answer
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export { AdminAnswersTable };
