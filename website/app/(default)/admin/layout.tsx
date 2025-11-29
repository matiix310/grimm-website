import { Navbar } from "@/components/admin/Navbar";

const AdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 px-5 lg:px-8">
        <h1 className="font-paytone text-7xl">Admin</h1>
        <Navbar
          routes={[
            { name: "Clés API", path: "/admin/api-keys" },
            { name: "Évenements", path: "/admin/events" },
            { name: "Actualités", path: "/admin/news" },
            { name: "Utilisateurs", path: "/admin/users" },
            { name: "Codes", path: "/admin/codes" },
            { name: "Réponses", path: "/admin/answers" },
          ]}
          className="max-w-full overflow-x-scroll"
        />
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
