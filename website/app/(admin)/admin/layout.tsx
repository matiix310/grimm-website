import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/Sidebar";
import { hasPermission } from "@/utils/auth";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";

const AdminLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const headers = await nextHeaders();

  const canAccessAdminPanel = await hasPermission({
    headers,
    permissions: { adminPanel: ["access"] },
  });

  if (!canAccessAdminPanel) return redirect("/");

  const [
    canAccessApiKeys,
    canAccessEvents,
    canAccessNews,
    canAccessUsers,
    canAccessCodes,
    canAccessAnswers,
    canAccessDiscord,
  ] = await Promise.all([
    hasPermission({
      headers,
      permissions: { "api-keys": ["create"] },
    }),
    hasPermission({
      headers,
      permissions: { events: ["update", "create", "delete"] },
    }),
    hasPermission({
      headers,
      permissions: { news: ["update", "create", "delete"] },
    }),
    hasPermission({
      headers,
      permissions: {
        user: [
          "list",
          "create",
          "update",
          "delete",
          "set-password",
          "set-role",
          "ban",
          "sync-roles",
        ],
      },
    }),
    hasPermission({
      headers,
      permissions: { codes: ["list", "create", "update", "delete"] },
    }),
    hasPermission({
      headers,
      permissions: { answers: ["list", "create", "delete", "update"] },
    }),
    hasPermission({
      headers,
      permissions: { discord: ["admin"] },
    }),
  ]);

  return (
    <SidebarProvider>
      <AdminSidebar
        canAccessApiKeys={canAccessApiKeys}
        canAccessEvents={canAccessEvents}
        canAccessNews={canAccessNews}
        canAccessUsers={canAccessUsers}
        canAccessCodes={canAccessCodes}
        canAccessAnswers={canAccessAnswers}
        canAccessDiscord={canAccessDiscord}
      />
      <main className="w-full">
        <div className="flex items-center gap-2 p-4">
          <SidebarTrigger />
          <h1 className="font-paytone text-3xl">Admin</h1>
        </div>
        <div className="p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
};

export default AdminLayout;
