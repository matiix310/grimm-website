"use client";

import { AdminUserCreateButton } from "@/components/admin/users/AdminUserCreateButton";
import { AdminUsersTable } from "@/components/admin/users/AdminUsersTable";

const UsersPage = () => {
  return (
    <div className="mx-8 flex flex-col gap-4">
      <AdminUserCreateButton onNewUser={() => {}} />
      <AdminUsersTable />
    </div>
  );
};

export default UsersPage;
