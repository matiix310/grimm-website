"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { rolesMetadata } from "@/lib/permissions";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Loader2, Trash } from "lucide-react";

type Guild = {
  id: string;
  name: string;
  icon: string | null;
};

type Role = {
  id: string;
  name: string;
  color: string;
  position: number;
};

type Mapping = {
  id: string;
  guildId: string;
  discordRoleId: string;
  websiteRoleId: string;
};

const API_URL = "/api/admin/discord";

export function DiscordAdminPanel() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [localMappings, setLocalMappings] = useState<
    { discordRoleId: string; websiteRoleId: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGuilds();
    fetchMappings();
  }, []);

  useEffect(() => {
    if (selectedGuild) {
      fetchRoles(selectedGuild);
    }
  }, [selectedGuild]);

  useEffect(() => {
    if (selectedGuild) {
      // Filter mappings for selected guild
      const guildMappings = mappings.filter((m) => m.guildId === selectedGuild);
      setLocalMappings(
        guildMappings.map((m) => ({
          discordRoleId: m.discordRoleId,
          websiteRoleId: m.websiteRoleId,
        }))
      );
    } else {
      setRoles([]);
      setLocalMappings([]);
    }
  }, [selectedGuild, mappings]);

  const fetchGuilds = async () => {
    try {
      const res = await fetch(`${API_URL}/guilds`);
      if (!res.ok) throw new Error("Failed to fetch guilds");
      const data = await res.json();
      setGuilds(data);
    } catch (error) {
      toast.error("Impossible de récupérer les serveurs Discord");
    }
  };

  const fetchRoles = async (guildId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/guilds/${guildId}/roles`);
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setRoles(data.sort((a: Role, b: Role) => b.position - a.position));
    } catch (error) {
      toast.error("Impossible de récupérer les rôles Discord");
    } finally {
      setLoading(false);
    }
  };

  const fetchMappings = async () => {
    try {
      const res = await fetch(`${API_URL}/mappings`);
      if (!res.ok) throw new Error("Failed to fetch mappings");
      const data = await res.json();
      setMappings(data);
    } catch (error) {
      toast.error("Impossible de récupérer les mappings");
    }
  };

  const handleSave = async () => {
    if (!selectedGuild) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/mappings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guildId: selectedGuild,
          mappings: localMappings,
        }),
      });
      if (!res.ok) throw new Error("Failed to save mappings");
      toast.success("Mappings sauvegardés avec succès");
      fetchMappings();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const addMapping = () => {
    setLocalMappings([...localMappings, { discordRoleId: "", websiteRoleId: "" }]);
  };

  const removeMapping = (index: number) => {
    const newMappings = [...localMappings];
    newMappings.splice(index, 1);
    setLocalMappings(newMappings);
  };

  const updateMapping = (
    index: number,
    field: "discordRoleId" | "websiteRoleId",
    value: string
  ) => {
    const newMappings = [...localMappings];
    newMappings[index][field] = value;
    setLocalMappings(newMappings);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Configuration Discord</h2>
        <p className="text-sm text-muted-foreground">
          Gérez les correspondances entre les rôles Discord et les rôles du site.
        </p>
      </div>
      <div className="pt-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-full max-w-sm">
            <label className="text-sm font-medium mb-2 block">Serveur Discord</label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedGuild || ""}
              onChange={(e) => setSelectedGuild(e.target.value || null)}
            >
              <option value="">Sélectionner un serveur...</option>
              {guilds.map((guild) => (
                <option key={guild.id} value={guild.id}>
                  {guild.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedGuild && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Mappings des rôles</h3>
              <Button onClick={addMapping} variant="outline" size="sm">
                Ajouter un mapping
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rôle Discord</TableHead>
                      <TableHead>Rôle Site</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localMappings.map((mapping, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={mapping.discordRoleId}
                            onChange={(e) =>
                              updateMapping(index, "discordRoleId", e.target.value)
                            }
                          >
                            <option value="">Sélectionner un rôle...</option>
                            {roles.map((role) => (
                              <option
                                key={role.id}
                                value={role.id}
                                style={{
                                  color:
                                    role.color !== "#000000" ? role.color : undefined,
                                }}
                              >
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={mapping.websiteRoleId}
                            onChange={(e) =>
                              updateMapping(index, "websiteRoleId", e.target.value)
                            }
                          >
                            <option value="">Sélectionner un rôle...</option>
                            {Object.entries(rolesMetadata).map(([key, meta]) => (
                              <option key={key} value={key}>
                                {meta.displayName}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMapping(index)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {localMappings.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground"
                        >
                          Aucun mapping configuré pour ce serveur.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving || loading}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
