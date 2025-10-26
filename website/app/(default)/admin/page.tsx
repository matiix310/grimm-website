import { redirect } from "next/navigation";

const AdminPage = () => {
  redirect("/admin/tokens");
};

export default AdminPage;
