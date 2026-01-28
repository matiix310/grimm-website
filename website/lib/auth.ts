import { db } from "@/db";
import { getEnv, getEnvOrThrow } from "@/lib/env";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  admin as adminPlugin,
  apiKey,
  createAuthMiddleware,
  genericOAuth,
  username,
} from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import {
  adminRole,
  bureauRole,
  memberRole,
  respoAssistantsRole,
  respoComRole,
  respoDesignRole,
  respoInterRole,
  respoTechRole,
  respoVJRole,
  respoWeiRole,
  respoEventRole,
  respoMerchRole,
  respoPartRole,
  respoTresoRole,
  staffRole,
  statement,
  teamComRole,
  teamDesignRole,
  teamTechRole,
  teamEventRole,
  teamPartRole,
  teamTresoRole,
  userRole,
} from "./permissions";
import { performUserRoleSync } from "./sync-roles";

const ac = createAccessControl(statement);

export const user = ac.newRole(userRole);
export const admin = ac.newRole(adminRole);
export const bureau = ac.newRole(bureauRole);
// respos
export const respoTech = ac.newRole(respoTechRole);
export const respoDesign = ac.newRole(respoDesignRole);
export const respoCom = ac.newRole(respoComRole);
export const respoAssistants = ac.newRole(respoAssistantsRole);
export const respoWei = ac.newRole(respoWeiRole);
export const respoInter = ac.newRole(respoInterRole);
export const respoVJ = ac.newRole(respoVJRole);
export const respoEvent = ac.newRole(respoEventRole);
export const respoMerch = ac.newRole(respoMerchRole);
export const respoPart = ac.newRole(respoPartRole);
export const respoTreso = ac.newRole(respoTresoRole);
// teams
export const teamTech = ac.newRole(teamTechRole);
export const teamDesign = ac.newRole(teamDesignRole);
export const teamCom = ac.newRole(teamComRole);
export const teamEvent = ac.newRole(teamEventRole);
export const teamPart = ac.newRole(teamPartRole);
export const teamTreso = ac.newRole(teamTresoRole);
// members
export const member = ac.newRole(memberRole);
export const staff = ac.newRole(staffRole);

const roles = {
  user,
  admin,
  bureau,
  respoTech,
  respoDesign,
  respoCom,
  respoAssistants,
  respoWei,
  respoInter,
  respoVJ,
  respoEvent,
  respoMerch,
  respoPart,
  respoTreso,
  teamTech,
  teamDesign,
  teamCom,
  teamEvent,
  teamPart,
  teamTreso,
  member,
  staff,
};

export type Roles = keyof typeof roles;

export const auth = betterAuth({
  baseURL: getEnvOrThrow("BASE_URL"),
  secret: getEnvOrThrow("BETTER_AUTH_SECRET"),
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
  advanced: {
    ...(process.env.NODE_ENV === "production"
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: "bde-grimm.com",
          },
        }
      : {}),
  },
  trustedOrigins: [
    "https://bde-grimm.com",
    "https://liste.bde-grimm.com",
    "https://db.bde-grimm.com",
  ],
  account: {
    accountLinking: {
      allowDifferentEmails: true,
    },
  },
  socialProviders: {
    discord: {
      clientId: getEnv("DISCORD_CLIENT_ID") ?? "123",
      clientSecret: getEnv("DISCORD_CLIENT_SECRET") ?? "123",
      disableSignUp: true,
    },
    google: {
      clientId: getEnv("GOOGLE_CLIENT_ID") ?? "123",
      clientSecret: getEnv("GOOGLE_CLIENT_SECRET") ?? "123",
      disableSignUp: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/callback/:id") {
        const provider = ctx.params.id;
        if (provider === "google" || provider === "discord") {
          const session = await auth.api.getSession({
            headers: ctx.headers ?? new Headers(),
          });

          if (session?.user.login) {
            await performUserRoleSync(session.user.login);
          }
        }
      }
    }),
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
          clientId: getEnvOrThrow("FORGE_ID_CLIENT_ID"),
          clientSecret: getEnvOrThrow("FORGE_ID_CLIENT_SECRET"),
          discoveryUrl: "https://cri.epita.fr/.well-known/openid-configuration",
          scopes: ["openid", "profile"],
          redirectURI:
            getEnvOrThrow("BASE_URL") +
            (process.env.NODE_ENV === "development"
              ? "/complete/epita/"
              : "/api/auth/oauth2/callback/forge-id"),
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
    username(),
    nextCookies(), // Should always be the last plugin in the array
  ],
});
