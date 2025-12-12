import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { News } from "@/db/schema/news";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import { AdminNewsEditDialog } from "./AdminNewsEditDialog";
import { $fetch } from "@/lib/betterFetch";
import { DataTable, SortableHeader } from "@/components/ui/DataTable";

type AdminNewsTableProps = {
  news: News[];
  onRemoveNews: (newsId: string) => unknown;
  onUpdateNews: (news: News) => unknown;
};

const AdminNewsTable = ({ news, onRemoveNews, onUpdateNews }: AdminNewsTableProps) => {
  const [editValues, setEditValues] = React.useState<News>();

  const columnHelper = createColumnHelper<News>();
  const columns: ColumnDef<News>[] = [
    columnHelper.accessor("name", {
      header: ({ column }) => <SortableHeader column={column} title="Nom" />,
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => <SortableHeader column={column} title="Date de création" />,
      cell: (row) => row.getValue()?.toLocaleString("fr-FR") ?? "infinite",
    }),
    columnHelper.accessor("updatedAt", {
      header: ({ column }) => (
        <SortableHeader column={column} title="Dernière modification" />
      ),
      cell: (row) => row.getValue()?.toLocaleString("fr-FR") ?? "infinite",
    }),
    {
      id: "actions",
      cell: (row) => {
        const newsId = row.row.original.id;

        const handleEdit = async () => {
          setEditValues(row.row.original);
        };

        const handleDelete = async () => {
          const { data, error } = await $fetch("@delete/api/news/:newsId", {
            params: { newsId: newsId },
          });

          if (error) throw new Error(error.message);

          onRemoveNews(data.id);
        };

        return (
          <div className="flex justify-end">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <span className="sr-only">Ouvrir le menu de cette actualité</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
  ] as Array<ColumnDef<News, unknown>>;

  return (
    <>
      <AdminNewsEditDialog
        open={!!editValues}
        onOpenChange={(open) => {
          if (!open) setEditValues(undefined);
        }}
        news={editValues}
        onEditNews={onUpdateNews}
      />
      <DataTable
        columns={columns}
        data={news}
        filterColumn="name"
        searchPlaceholder="Nom de l'actualité..."
      />
    </>
  );
};

export { AdminNewsTable };
