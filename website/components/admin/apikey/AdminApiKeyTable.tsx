import { ApiKey } from "@/app/(admin)/admin/api-keys/page";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/authClient";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { DataTable, SortableHeader } from "@/components/ui/DataTable";

type AdminApiKeyTableProps = {
  apiKeys: ApiKey[];
  onRemoveApiKey: (keyId: string) => unknown;
};

const AdminApiKeyTable = ({ apiKeys, onRemoveApiKey }: AdminApiKeyTableProps) => {
  const columnHelper = createColumnHelper<ApiKey>();
  const columns: ColumnDef<ApiKey>[] = [
    columnHelper.accessor("name", {
      header: ({ column }) => <SortableHeader column={column} title="Nom" />,
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("expiresAt", {
      header: ({ column }) => <SortableHeader column={column} title="Expiration" />,
      cell: (row) =>
        row.getValue()?.toLocaleString("fr-FR", {
          timeZone: "UTC",
        }) ?? "infinite",
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => <SortableHeader column={column} title="Création" />,
      cell: (row) =>
        row.getValue().toLocaleString("fr-FR", {
          timeZone: "UTC",
        }),
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

  return (
    <DataTable
      columns={columns}
      data={apiKeys}
      filterColumn="name"
      searchPlaceholder="Nom de la clé..."
    />
  );
};

export { AdminApiKeyTable };
