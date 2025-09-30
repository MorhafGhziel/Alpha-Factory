import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { getRoleDashboardPath } from "./auth-middleware";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: true,
        required: false,
      },
      username: {
        type: "string",
        input: true,
        required: false,
      },
    },
  },
  callbacks: {
    after: [
      {
        matcher(context: { type: string }) {
          return context.type === "credential";
        },
        handler: async (ctx: {
          user: { role: string };
          redirect: (arg0: string) => Response | void;
        }) => {
          if (ctx.user?.role) {
            const dashboardPath = getRoleDashboardPath(ctx.user.role);
            return ctx.redirect(dashboardPath);
          }
        },
      },
    ],
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
