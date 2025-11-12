"use client";

import React from "react";
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
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Ban, MoreHorizontal } from "lucide-react";
import { UserWithRole } from "better-auth/plugins";
import { FullPagination } from "@/components/ui/FullPagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { AdminMinecraftEditDialog } from "./AdminMinecraftEditDialog";
import { AdminUserEditDialog } from "./AdminUserEditDialog";
import { Input } from "@/components/ui/Input";
import { redirect } from "next/navigation";

type AdminUsersTableProps = {
  _?: string;
};

type User = UserWithRole & { login: string };

const AdminUsersTable = ({}: AdminUsersTableProps) => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [editMinecraftUsername, setEditMinecraftUsername] = React.useState<string>();
  const [editUser, setEditUser] = React.useState<string>();

  const updateUser = (user: User) => {
    setUsers((old) => {
      const oldUser = old.find((u) => u.id === user.id);
      return [...old.filter((u) => u.id !== user.id), { ...oldUser, ...user }];
    });
  };

  const columnHelper = createColumnHelper<User>();
  const columns: ColumnDef<User>[] = [
    columnHelper.accessor("name", {
      header: "Nom",
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("login", {
      header: "Login",
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("banned", {
      header: "Banni",
      cell: (row) => (row.getValue() ? <Ban /> : ""),
    }),
    columnHelper.accessor("createdAt", {
      header: "Création",
      cell: (row) => row.getValue()?.toLocaleString("fr-FR") ?? "infinite",
    }),
    {
      id: "actions",
      cell: (row) => {
        const user = row.row.original;

        const handleEditUser = () => {
          setEditUser(user.login);
        };

        const handleEditMinecraft = () => {
          setEditMinecraftUsername(user.login);
        };

        const handleBan = async () => {
          const { data, error } = await authClient.admin.banUser({
            userId: user.id,
          });

          if (error) throw new Error(error.message);
          updateUser(data.user);
        };

        const handleUnban = async () => {
          const { data, error } = await authClient.admin.unbanUser({
            userId: user.id,
          });

          if (error) throw new Error(error.message);
          updateUser(data.user);
        };

        const handleShowProfile = () => {
          redirect(`/users/${user.login}`);
        };

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Ouvrir le menu de cet utilisateur</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShowProfile()}>
                  Voir le profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditUser()}>
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditMinecraft()}>
                  Définir le pseudo minecraft
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.banned ? (
                  <DropdownMenuItem variant="default" onClick={() => handleUnban()}>
                    Débannir
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem variant="destructive" onClick={() => handleBan()}>
                    Bannir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ] as Array<ColumnDef<User, unknown>>;

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  React.useEffect(() => {
    authClient.admin
      .listUsers({
        query: {
          limit: 1000,
        },
      })
      .then(({ data, error }) => {
        if (error) throw new Error(error.message);
        setUsers(data.users as User[]);
      });
  }, []);

  return (
    <>
      <AdminUserEditDialog
        userLogin={editUser}
        open={!!editUser}
        onOpenChange={(open) => {
          if (!open) setEditUser(undefined);
        }}
        onUpdateUser={(user) => updateUser(user as User)}
      />
      <AdminMinecraftEditDialog
        userLogin={editMinecraftUsername}
        open={!!editMinecraftUsername}
        onOpenChange={(open) => {
          if (!open) setEditMinecraftUsername(undefined);
        }}
      />
      <Input
        placeholder="Nom du joueur..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
        className="max-w-sm"
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
                  Aucun utilisateur
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <FullPagination
        selectedPage={table.getState().pagination.pageIndex}
        totalPages={Math.ceil(users.length / table.getState().pagination.pageSize)}
        onPageChange={(i) => table.setPageIndex(i)}
      />
    </>
  );
};

export { AdminUsersTable };
