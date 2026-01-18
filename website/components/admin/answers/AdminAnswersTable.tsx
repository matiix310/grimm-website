import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import { $fetch } from "@/lib/betterFetch";
import { AdminAnswerEditDialog } from "./AdminAnswerEditDialog";
import { InferQueryModel } from "@/db";
import { Answers as AnswersSchema } from "@/db/schema/answers";
import { AdminQrCodeDialog } from "./AdminQrCodeDialog";
import { DataTable, SortableHeader } from "@/components/ui/DataTable";

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
      header: ({ column }) => <SortableHeader column={column} title="Nom" />,
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("points", {
      header: ({ column }) => <SortableHeader column={column} title="Points" />,
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("users", {
      header: ({ column }) => (
        <SortableHeader column={column} title="Nombre de réponse" />
      ),
      cell: (row) => row.getValue().length,
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => <SortableHeader column={column} title="Date de création" />,
      cell: (row) =>
        row.getValue()?.toLocaleString("fr-FR", {
          timeZone: "UTC",
        }) ?? "infinite",
    }),
    columnHelper.accessor("updatedAt", {
      header: ({ column }) => (
        <SortableHeader column={column} title="Dernière modification" />
      ),
      cell: (row) =>
        row.getValue()?.toLocaleString("fr-FR", {
          timeZone: "UTC",
        }) ?? "infinite",
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
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
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
      <DataTable
        columns={columns}
        data={answers}
        filterColumn="name"
        searchPlaceholder="Nom de la réponse..."
      />
    </>
  );
};

export { AdminAnswersTable };
