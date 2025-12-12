import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { Client } from "discord.js";
import { db } from "../db";
import { discordRoleMappings } from "../db/schema/discord-roles";
import { eq } from "drizzle-orm";

export const createApi = (client: Client) => {
  const app = new Elysia()
    .use(cors())
    .get("/guilds", () => {
      return client.guilds.cache.map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.iconURL(),
      }));
    })
    .get("/guilds/:id/roles", async ({ params: { id } }) => {
      try {
        const guild = await client.guilds.fetch(id);
        const roles = await guild.roles.fetch();
        return roles.map((role) => ({
          id: role.id,
          name: role.name,
          color: role.hexColor,
          position: role.position,
        }));
      } catch (error) {
        return { error: "Guild not found or bot missing permissions" };
      }
    })
    .get("/mappings", async () => {
      return await db.select().from(discordRoleMappings);
    })
    .post(
      "/mappings",
      async ({ body }) => {
        const { guildId, mappings } = body;

        await db.transaction(async (tx) => {
          // Delete existing mappings for this guild
          await tx
            .delete(discordRoleMappings)
            .where(eq(discordRoleMappings.guildId, guildId));

          // Insert new mappings
          if (mappings.length > 0) {
            await tx.insert(discordRoleMappings).values(
              mappings.map((m) => ({
                guildId,
                discordRoleId: m.discordRoleId,
                websiteRoleId: m.websiteRoleId,
              }))
            );
          }
        });

        return { success: true };
      },
      {
        body: t.Object({
          guildId: t.String(),
          mappings: t.Array(
            t.Object({
              discordRoleId: t.String(),
              websiteRoleId: t.String(),
            })
          ),
        }),
      }
    );

  return app;
};
