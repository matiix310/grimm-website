import { db } from "@/db";
import { createId } from "@paralleldrive/cuid2";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin, genericOAuth } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  project: ["create", "share", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

export const user = ac.newRole({
  project: ["create"],
  ...userAc.statements,
});

export const admin = ac.newRole({
  project: ["create", "update"],
  ...adminAc.statements,
});

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
        defaultValue: () => createId(),
      },
    },
  },
  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
      },
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
          scopes: ["profile", "epita", "email"],
          redirectURI: `${process.env.BASE_URL}/complete/epita/`,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          mapProfileToUser: (profile) => ({
            login: profile.id,
            image: `https://photos.cri.epita.fr/square/${profile.id}`,
          }),
        },
      ],
    }),
    nextCookies(), // Should always be the last plugin in the array
  ],
});
