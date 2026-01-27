"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { authClient } from "@/lib/authClient";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Ban, MoreHorizontal } from "lucide-react";
import { UserWithRole } from "better-auth/plugins";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { AdminMinecraftEditDialog } from "./AdminMinecraftEditDialog";
import { AdminUserEditDialog } from "./AdminUserEditDialog";
import { redirect } from "next/navigation";
import { DataTable, SortableHeader } from "@/components/ui/DataTable";
import { $fetch } from "@/lib/betterFetch";
import { toast } from "sonner";

type AdminUsersTableProps = {
  _?: string;
};

type User = Omit<UserWithRole & { login: string }, "email" | "emailVerified">;

const AdminUsersTable = ({}: AdminUsersTableProps) => {
  const [users, setUsers] = React.useState<User[]>([]);
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
      header: ({ column }) => <SortableHeader column={column} title="Nom" />,
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("login", {
      header: ({ column }) => <SortableHeader column={column} title="Login" />,
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("role", {
      header: ({ column }) => <SortableHeader column={column} title="Role" />,
      cell: (row) => row.getValue(),
    }),
    columnHelper.accessor("banned", {
      header: ({ column }) => <SortableHeader column={column} title="Banni" />,
      cell: (row) => (row.getValue() ? <Ban className="text-destructive" /> : ""),
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => <SortableHeader column={column} title="Création" />,
      cell: (row) =>
        row.getValue()?.toLocaleString("fr-FR", {
          timeZone: "UTC",
        }) ?? "infinite",
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
          updateUser({ ...data.user, banned: true, login: user.login });
        };

        const handleUnban = async () => {
          const { data, error } = await authClient.admin.unbanUser({
            userId: user.id,
          });

          if (error) throw new Error(error.message);
          updateUser({ ...data.user, banned: false, login: user.login });
        };

        const handleShowProfile = () => {
          redirect(`/users/${user.login}`);
        };

        const handleSyncRoles = async () => {
          const loadingToast = toast.loading("Synchronising user with other services...");

          const { data, error } = await $fetch("/api/users/:id", {
            params: {
              id: user.login,
            },
          });

          toast.dismiss(loadingToast);

          if (error) {
            toast.error(error.message);
            throw new Error(error.message);
          }

          toast.success("User roles synchronised");

          updateUser({ ...user, role: data.user.roles.join(",") });
        };

        return (
          <div className="flex justify-end">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
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
                <DropdownMenuItem onClick={() => handleSyncRoles()}>
                  Synchroniser les rôles
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
      <DataTable
        columns={columns}
        data={users}
        filterColumn="name"
        searchPlaceholder="Nom du joueur..."
      />
    </>
  );
};

export { AdminUsersTable };
