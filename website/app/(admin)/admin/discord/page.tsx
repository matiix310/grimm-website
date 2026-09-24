import { DiscordAdminPanel } from "@/components/admin/discord/DiscordAdminPanel";
import { listAuthentikGroups } from "@/lib/authentik";

export default async function DiscordAdminPage() {
  const websiteRoles = await listAuthentikGroups();
  return <DiscordAdminPanel websiteRoles={websiteRoles} />;
}
