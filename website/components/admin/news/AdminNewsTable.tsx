import { Button } from "@/components/ui/Button";
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
import { Trash2 } from "lucide-react";

type AdminNewsTableProps = {
  news: News[];
  onRemoveNews: (newsId: string) => unknown;
};

const AdminNewsTable = ({ news, onRemoveNews }: AdminNewsTableProps) => {
  const columnHelper = createColumnHelper<News>();
  const columns: ColumnDef<News>[] = [
    columnHelper.accessor("name", {
      header: "Nom",
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("createdAt", {
      header: "Création",
      cell: (row) => row.getValue()?.toLocaleString() ?? "infinite",
    }),
    {
      id: "actions",
      cell: (row) => {
        const newsId = row.row.original.id;
        return (
          <div className="flex items-center justify-end">
            <Button
              variant="destructive"
              size="icon"
              onClick={async () => {
                const res = await fetch("/api/news", {
                  method: "DELETE",
                  body: JSON.stringify({ id: newsId }),
                });

                if (res.status !== 200) throw new Error("Error while deleting the news");

                const json = await res.json();

                if (json.error) throw new Error(json.message);

                onRemoveNews(newsId);
              }}
            >
              <Trash2 />
            </Button>
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
  );
};

export { AdminNewsTable };
