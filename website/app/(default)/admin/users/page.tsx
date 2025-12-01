"use client";

import { AdminUserCreateButton } from "@/components/admin/users/AdminUserCreateButton";
import { AdminUsersTable } from "@/components/admin/users/AdminUsersTable";
import { AdminUserSyncButton } from "@/components/admin/users/AdminUserSyncButton";

const UsersPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <AdminUserCreateButton onNewUser={() => {}} />
        <AdminUserSyncButton />
      </div>
      <AdminUsersTable />
    </div>
  );
};

export default UsersPage;
