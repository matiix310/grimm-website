"use client";

import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { authClient } from "@/lib/authClient";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { UserWithRole } from "better-auth/plugins";
import { Ban, MoreHorizontal } from "lucide-react";
import { redirect } from "next/navigation";

type User = UserWithRole & { login: string };

type ColumnActions = {
  onEdit?: (login: string) => unknown;
  onEditMinecraftUsername?: (login: string) => unknown;
  onUpdate?: (user: User) => unknown;
};

const columnHelper = createColumnHelper<User>();
export const columns: ColumnDef<User>[] = [
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
    cell: ({ row, table }) => {
      const user = row.original;
      const { onEdit, onEditMinecraftUsername, onUpdate } = table.options
        .meta as ColumnActions;

      const handleEditUser = () => {
        if (onEdit) onEdit(user.login);
      };

      const handleEditMinecraft = () => {
        if (onEditMinecraftUsername) onEditMinecraftUsername(user.login);
      };

      const handleBan = async () => {
        const { data, error } = await authClient.admin.banUser({
          userId: user.id,
        });

        if (error) throw new Error(error.message);
        if (onUpdate) onUpdate(data.user);
      };

      const handleUnban = async () => {
        const { data, error } = await authClient.admin.unbanUser({
          userId: user.id,
        });

        if (error) throw new Error(error.message);
        if (onUpdate) onUpdate(data.user);
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
