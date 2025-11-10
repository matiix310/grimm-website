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
import { AdminCodeEditDialog } from "./AdminCodeEditDialog";
import { InferQueryModel } from "@/db";
import { RedeemCodes as RedeemCodesSchema } from "@/db/schema/redeemCodes";
import { AdminQrCodeDialog } from "./AdminQrCodeDialog";

type RedeemCodes = InferQueryModel<
  "redeemCodes",
  { users: { columns: { userId: true; createdAt: true } } }
>;

type AdminCodesTableProps = {
  codes: RedeemCodes[];
  onRemoveCode: (code: string) => unknown;
  onUpdateCode: (code: RedeemCodesSchema) => unknown;
};

const AdminCodesTable = ({ codes, onRemoveCode, onUpdateCode }: AdminCodesTableProps) => {
  const [editValues, setEditValues] = React.useState<RedeemCodes>();
  const [shownCode, setShownCode] = React.useState<RedeemCodes>();

  const columnHelper = createColumnHelper<RedeemCodes>();
  const columns: ColumnDef<RedeemCodes>[] = [
    columnHelper.accessor("name", {
      header: "Nom",
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("points", {
      header: "Points",
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("users", {
      header: "Utilisations",
      cell: (row) => row.getValue().length,
    }),
    columnHelper.accessor("maxUsage", {
      header: "Utilisations maximums",
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("createdAt", {
      header: "Date de création",
      cell: (row) => row.getValue()?.toLocaleString("fr-FR") ?? "infinite",
    }),
    columnHelper.accessor("updatedAt", {
      header: "Dernière modification",
      cell: (row) => row.getValue()?.toLocaleString("fr-FR") ?? "infinite",
    }),
    {
      id: "actions",
      cell: (row) => {
        const code = row.row.original;

        const handleShow = () => {
          setShownCode(code);
        };

        const handleEdit = async () => {
          setEditValues(code);
        };

        const handleCopy = () => {
          navigator.clipboard.writeText(`${window.location.origin}/redeem/${code.code}`);
        };

        const handleDelete = async () => {
          const { data, error } = await $fetch("@delete/api/admin/codes/:codeId", {
            params: { codeId: code.id },
          });

          if (error) throw new Error(error.message);

          onRemoveCode(data.id);
        };

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ouvrir le menu de ce code</span>
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
  ] as Array<ColumnDef<RedeemCodes, unknown>>;

  const table = useReactTable({
    data: codes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <AdminQrCodeDialog
        open={!!shownCode}
        onOpenChange={(open) => {
          if (!open) setShownCode(undefined);
        }}
        code={shownCode}
      />
      <AdminCodeEditDialog
        open={!!editValues}
        onOpenChange={(open) => {
          if (!open) setEditValues(undefined);
        }}
        code={editValues}
        onEditCode={onUpdateCode}
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
                  Aucun code
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export { AdminCodesTable };
