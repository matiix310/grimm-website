import z from "zod";

import refreshSchema from "./refresh/routeSchema";

const schema = {
  "/api/ranking": {
    query: z.object({
      limit: z.number().positive(),
      offset: z.number().min(0),
    }),
    output: z.object({
      limit: z.number().positive(),
      offset: z.number().min(0),
      total: z.number().min(0),
      ranking: z.array(
        z.object({
          points: z.number(),
          rank: z.number(),
          user: z.object({
            name: z.string(),
            login: z.string(),
          }),
        })
      ),
    }),
  },
  ...refreshSchema,
};

export default schema;
