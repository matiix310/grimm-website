import { user } from "@/db/schema/auth";
import { rolesMetadata } from "@/lib/permissions";
import { createSelectSchema } from "drizzle-zod";
import z from "zod";

import pointsSchema from "./points/routeSchema";
import minecraftLinkSchema from "./minecraft/link/routeSchema";

const UserSelectSchema = createSelectSchema(user);

const schema = {
  "/api/users/:id": {
    output: z.object({
      user: UserSelectSchema.pick({
        id: true,
        name: true,
        image: true,
        role: true,
        banned: true,
        login: true,
      }).and(z.object({ updatedAt: z.coerce.date(), createdAt: z.coerce.date() })),
      canGiveRoles: z.array(z.string()),
    }),
  },
  "@post/api/users/:id": {
    input: z.object({
      name: z.optional(z.string()),
      role: z.optional(
        z.union(
          Object.keys(rolesMetadata).map((r) =>
            z.literal(r as keyof typeof rolesMetadata)
          )
        )
      ),
    }),
    output: UserSelectSchema.pick({
      id: true,
      name: true,
      image: true,
      role: true,
      banned: true,
      login: true,
    }).and(z.object({ updatedAt: z.coerce.date(), createdAt: z.coerce.date() })),
  },
  ...pointsSchema,
  ...minecraftLinkSchema,
};

export default schema;
