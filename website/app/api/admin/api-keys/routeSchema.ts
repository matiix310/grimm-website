import { apiSafeStatement } from "@/lib/permissions";
import z from "zod";

const schema = {
  "@put/api/admin/api-keys": {
    input: z.object({
      name: z.string().nonempty(),
      expiresIn: z.number().positive(),
      permissions: z.optional(
        z.partialRecord(
          z.union(
            Object.keys(apiSafeStatement).map((p) =>
              z.literal(p as keyof typeof apiSafeStatement)
            )
          ),
          z.array(z.string()).nonempty()
        )
      ),
    }),
    output: z.object({
      key: z.string(),
      metadata: z.any(),
      permissions: z.any(),
      id: z.string(),
      name: z.string().nullable(),
      start: z.string().nullable(),
      prefix: z.string().nullable(),
      userId: z.string(),
      refillInterval: z.number().nullable(),
      refillAmount: z.number().nullable(),
      lastRefillAt: z.coerce.date().nullable(),
      enabled: z.boolean(),
      rateLimitEnabled: z.boolean(),
      rateLimitTimeWindow: z.number().nullable(),
      rateLimitMax: z.number().nullable(),
      requestCount: z.number(),
      remaining: z.number().nullable(),
      lastRequest: z.coerce.date().nullable(),
      expiresAt: z.coerce.date().nullable(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
    }),
  },
};

export default schema;
