"use client";

import { AdminUsersTable } from "@/components/admin/users/AdminUsersTable";

const UsersPage = () => {
  return (
    <div className="mx-8 flex flex-col gap-4">
      <AdminUsersTable />
    </div>
  );
};

export default UsersPage;
