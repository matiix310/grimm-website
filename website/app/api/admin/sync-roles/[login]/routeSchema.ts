import z from "zod";

const schema = {
  "@post/api/admin/sync-roles/[login]": {
    output: z.object({
      success: z.boolean(),
      message: z.string(),
      details: z
        .object({
          updated: z.number(),
          cleared: z.number(),
          errors: z.array(z.string()),
          changes: z.array(
            z.object({
              login: z.string(),
              from: z.array(z.string()),
              to: z.array(z.string()),
            })
          ),
        })
        .optional(),
    }),
  },
};

export default schema;
