import { user } from "@/db/schema/auth";
import { createSelectSchema } from "drizzle-zod";
import z from "zod";

import pointsSchema from "./points/routeSchema";
import minecraftLinkSchema from "./minecraft/link/routeSchema";

const UserSelectSchema = createSelectSchema(user);

// Roles here mirror the server validation in route.ts: any Authentik group
// name is acceptable, with priority gating enforced server-side.
const websiteRoleSchema = z.string().min(1);

const schema = {
  "/api/users/:id": {
    output: z.object({
      user: UserSelectSchema.pick({
        id: true,
        name: true,
        image: true,
        banned: true,
        login: true,
      }).and(
        z.object({
          updatedAt: z.coerce.date(),
          createdAt: z.coerce.date(),
          roles: z.array(websiteRoleSchema),
        })
      ),
      connections: z.object({
        discord: z.string().optional(),
        minecraft: z.string().optional(),
      }),
      canEditRoles: z.array(websiteRoleSchema),
    }),
  },
  "@post/api/users/:id": {
    input: z.object({
      name: z.optional(z.string()),
      roles: z.optional(z.array(websiteRoleSchema)),
    }),
    output: UserSelectSchema.pick({
      id: true,
      name: true,
      image: true,
      banned: true,
      login: true,
    }).and(
      z.object({
        updatedAt: z.coerce.date(),
        createdAt: z.coerce.date(),
        roles: z.array(websiteRoleSchema),
      })
    ),
  },
  ...pointsSchema,
  ...minecraftLinkSchema,
};

export default schema;
