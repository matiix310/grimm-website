import { GoogleStaffRegister } from "@/components/staff/register/GoogleStaffRegister";
import { auth } from "@/lib/auth";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";

const GoogleStaffRegisterPage = async () => {
  const headers = await nextHeaders();

  const session = await auth.api.getSession({
    headers,
  });

  if (!session) return redirect("/login?redirect=/staff/register");

  // check if the user is already linked
  const accounts = await auth.api.listUserAccounts({ headers }).catch(() => []);

  const googleAccount = accounts.find((a) => a.providerId === "google");

  if (googleAccount) return redirect("/");

  return <GoogleStaffRegister />;
};

export default GoogleStaffRegisterPage;
