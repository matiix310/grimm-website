import { redirect } from "next/navigation";

const AdminPage = () => {
  redirect("/admin/api-keys");
};

export default AdminPage;
