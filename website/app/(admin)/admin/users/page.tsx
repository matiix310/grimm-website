import { AdminUserCreateButton } from "@/components/admin/users/AdminUserCreateButton";
import { AdminUsersTable } from "@/components/admin/users/AdminUsersTable";
import { AdminUserSyncButton } from "@/components/admin/users/AdminUserSyncButton";
import { listAuthentikGroups } from "@/lib/authentik";

const UsersPage = async () => {
  const websiteRoles = await listAuthentikGroups();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <AdminUserCreateButton />
        <AdminUserSyncButton />
      </div>
      <AdminUsersTable websiteRoles={websiteRoles} />
    </div>
  );
};

export default UsersPage;
