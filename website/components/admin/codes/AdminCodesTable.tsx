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
import { AdminCodeEditDialog } from "./AdminCodeEditDialog";
import { InferQueryModel } from "@/db";
import { RedeemCodes as RedeemCodesSchema } from "@/db/schema/redeemCodes";
import { AdminQrCodeDialog } from "./AdminQrCodeDialog";
import { DataTable, SortableHeader } from "@/components/ui/DataTable";

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
      header: ({ column }) => <SortableHeader column={column} title="Nom" />,
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("points", {
      header: ({ column }) => <SortableHeader column={column} title="Points" />,
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("users", {
      header: ({ column }) => <SortableHeader column={column} title="Utilisations" />,
      cell: (row) => row.getValue().length,
    }),
    columnHelper.accessor("maxUsage", {
      header: ({ column }) => (
        <SortableHeader column={column} title="Utilisations maximums" />
      ),
      cell: (row) => row.getValue(),
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
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
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
      <DataTable
        columns={columns}
        data={codes}
        filterColumn="name"
        searchPlaceholder="Nom du code..."
      />
    </>
  );
};

export { AdminCodesTable };
