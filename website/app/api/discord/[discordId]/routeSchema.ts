import z from "zod";

const schema = {
  "/api/discord/:discordId": {
    output: z.object({
      login: z.string(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    }),
  },
};

export default schema;
