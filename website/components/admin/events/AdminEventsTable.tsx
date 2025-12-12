import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Events } from "@/db/schema/events";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import { AdminEventEditDialog } from "./AdminEventEditDialog";
import { $fetch } from "@/lib/betterFetch";
import { DataTable, SortableHeader } from "@/components/ui/DataTable";

type AdminEventsTableProps = {
  events: Events[];
  onRemoveEvent: (eventId: string) => unknown;
  onUpdateEvent: (event: Events) => unknown;
};

const AdminEventsTable = ({
  events,
  onRemoveEvent,
  onUpdateEvent,
}: AdminEventsTableProps) => {
  const [editValues, setEditValues] = React.useState<Events>();

  const columnHelper = createColumnHelper<Events>();
  const columns: ColumnDef<Events>[] = [
    columnHelper.accessor("name", {
      header: ({ column }) => <SortableHeader column={column} title="Nom" />,
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("date", {
      header: ({ column }) => <SortableHeader column={column} title="Date" />,
      cell: (row) => row.getValue().toLocaleString("fr-FR"),
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => <SortableHeader column={column} title="Date de création" />,
      cell: (row) => row.getValue().toLocaleString("fr-FR"),
    }),
    columnHelper.accessor("updatedAt", {
      header: ({ column }) => (
        <SortableHeader column={column} title="Dernière modification" />
      ),
      cell: (row) => row.getValue().toLocaleString("fr-FR"),
    }),
    {
      id: "actions",
      cell: (row) => {
        const eventId = row.row.original.id;

        const handleEdit = async () => {
          setEditValues(row.row.original);
        };

        const handleDelete = async () => {
          const { data, error } = await $fetch("@delete/api/events/:eventId", {
            params: { eventId: eventId },
          });

          if (error) throw new Error(error.message);

          onRemoveEvent(data.id);
        };

        return (
          <div className="flex justify-end">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <span className="sr-only">Ouvrir le menu de cet évenement</span>
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
  ] as Array<ColumnDef<Events, unknown>>;

  return (
    <>
      <AdminEventEditDialog
        open={!!editValues}
        onOpenChange={(open) => {
          if (!open) setEditValues(undefined);
        }}
        event={editValues}
        onEditEvent={onUpdateEvent}
      />
      <DataTable
        columns={columns}
        data={events}
        filterColumn="name"
        searchPlaceholder="Nom de l'évenement..."
      />
    </>
  );
};

export { AdminEventsTable };
