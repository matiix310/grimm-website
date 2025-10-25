import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const LogoutPage = async () => {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
};

export default LogoutPage;
