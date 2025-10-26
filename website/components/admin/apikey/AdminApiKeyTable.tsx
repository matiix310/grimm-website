import { ApiKey } from "@/app/(default)/admin/api-keys/page";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { authClient } from "@/lib/authClient";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

type AdminApiKeyTableProps = {
  apiKeys: ApiKey[];
  onRemoveApiKey: (keyId: string) => unknown;
};

const AdminApiKeyTable = ({ apiKeys, onRemoveApiKey }: AdminApiKeyTableProps) => {
  const columnHelper = createColumnHelper<ApiKey>();
  const columns: ColumnDef<ApiKey>[] = [
    columnHelper.accessor("name", {
      header: "Nom",
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("expiresAt", {
      header: "Expiration",
      cell: (row) => row.getValue()?.toLocaleString() ?? "infinite",
    }),
    columnHelper.accessor("createdAt", {
      header: "Création",
      cell: (row) => row.getValue().toLocaleString(),
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
                onRemoveApiKey(apiKeyId);
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
    data: apiKeys,
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
                Aucune clé api
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export { AdminApiKeyTable };
