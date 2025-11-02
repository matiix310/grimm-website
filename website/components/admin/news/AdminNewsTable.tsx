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
import { News } from "@/db/schema/news";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import { AdminNewsEditDialog } from "./AdminNewsEditDialog";

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
      header: "Nom",
      cell: (row) => row.getValue(),
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
        const newsId = row.row.original.id;

        const handleEdit = async () => {
          setEditValues(row.row.original);
        };

        const handleDelete = async () => {
          const res = await fetch(`/api/news/${newsId}`, {
            method: "DELETE",
          });

          if (res.status !== 200) throw new Error("Error while deleting the news");

          const json = await res.json();

          if (json.error) throw new Error(json.message);

          onRemoveNews(newsId);
        };

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
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

  const table = useReactTable({
    data: news,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
                  Aucune actualité
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export { AdminNewsTable };
