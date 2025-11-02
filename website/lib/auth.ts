import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, apiKey, genericOAuth } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminRole, managerRole, statement, userRole } from "./permissions";

const ac = createAccessControl(statement);

export const user = ac.newRole(userRole);
export const manager = ac.newRole(managerRole);
export const admin = ac.newRole(adminRole);

const roles = { user, manager, admin };

export type Roles = keyof typeof roles;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  user: {
    additionalFields: {
      login: {
        type: "string",
        required: true,
        unique: true,
      },
    },
  },
  plugins: [
    adminPlugin({
      ac,
      roles,
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    genericOAuth({
      config: [
        {
          providerId: "forge-id",
          clientId: process.env.FORGE_ID_CLIENT_ID!,
          clientSecret: process.env.FORGE_ID_CLIENT_SECRET!,
          discoveryUrl: "https://cri.epita.fr/.well-known/openid-configuration",
          scopes: ["openid", "profile"],
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          mapProfileToUser: (profile) => {
            return {
              login: profile.id,
              email: `${profile.id}@epita.fr`,
              emailVerified: true,
              image: `https://photos.cri.epita.fr/square/${profile.id}`,
            };
          },
        },
      ],
    }),
    apiKey({
      requireName: true,
    }),
    nextCookies(), // Should always be the last plugin in the array
  ],
});
