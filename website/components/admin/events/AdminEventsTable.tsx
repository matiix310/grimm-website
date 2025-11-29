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
import { Events } from "@/db/schema/events";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import { AdminEventEditDialog } from "./AdminEventEditDialog";
import { $fetch } from "@/lib/betterFetch";

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
      header: "Nom",
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("date", {
      header: "Date",
      cell: (row) => row.getValue().toLocaleString("fr-FR"),
    }),
    columnHelper.accessor("createdAt", {
      header: "Date de création",
      cell: (row) => row.getValue().toLocaleString("fr-FR"),
    }),
    columnHelper.accessor("updatedAt", {
      header: "Dernière modification",
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

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
                  Aucun évenement
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export { AdminEventsTable };
