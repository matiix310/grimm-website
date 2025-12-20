"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Sidebar";
import {
  Calendar,
  QrCode,
  Home,
  Key,
  MessageSquare,
  Newspaper,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DiscordIcon from "../icons/DiscordIcon";

const items = [
  {
    title: "Clés API",
    url: "/admin/api-keys",
    icon: Key,
  },
  {
    title: "Évenements",
    url: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Actualités",
    url: "/admin/news",
    icon: Newspaper,
  },
  {
    title: "Utilisateurs",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Codes",
    url: "/admin/codes",
    icon: QrCode,
  },
  {
    title: "Réponses",
    url: "/admin/answers",
    icon: MessageSquare,
  },
  {
    title: "Discord",
    url: "/admin/discord",
    icon: DiscordIcon,
  },
];

export function AdminSidebar({
  canAccessApiKeys,
  canAccessEvents,
  canAccessNews,
  canAccessUsers,
  canAccessCodes,
  canAccessAnswers,
  canAccessDiscord,
}: {
  canAccessApiKeys: boolean;
  canAccessEvents: boolean;
  canAccessNews: boolean;
  canAccessUsers: boolean;
  canAccessCodes: boolean;
  canAccessAnswers: boolean;
  canAccessDiscord: boolean;
}) {
  const pathname = usePathname();

  const filteredItems = items.filter((item) => {
    if (item.title === "Clés API") return canAccessApiKeys;
    if (item.title === "Évenements") return canAccessEvents;
    if (item.title === "Actualités") return canAccessNews;
    if (item.title === "Utilisateurs") return canAccessUsers;
    if (item.title === "Codes") return canAccessCodes;
    if (item.title === "Réponses") return canAccessAnswers;
    if (item.title === "Discord") return canAccessDiscord;
    return false;
  });

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.url)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Home />
                <span>Retour à l&apos;accueil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
