import { Navbar } from "@/components/admin/Navbar";

const AdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 ml-8">
        <h1 className="font-paytone text-7xl">Admin</h1>
        <Navbar
          routes={[
            { name: "tokens", path: "/admin/tokens" },
            { name: "events", path: "/admin/events" },
            { name: "news", path: "/admin/news" },
            { name: "users", path: "/admin/users" },
          ]}
        />
      </div>
      <div>{children}</div>
    </div>
  );
};

export default AdminLayout;
