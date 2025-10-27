import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, apiKey, genericOAuth } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { statement } from "./authStatement";

const ac = createAccessControl(statement);

export const user = ac.newRole({
  ...userAc.statements,
});

export const admin = ac.newRole({
  ...adminAc.statements,
  points: ["add", "delete"],
  news: ["create", "delete"],
  "api-keys": ["create"],
});

const roles = { user, admin };

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
          scopes: ["profile"],
          redirectURI: `${process.env.BASE_URL}${process.env.FORGE_ID_REDIRECT_URI}`,
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
