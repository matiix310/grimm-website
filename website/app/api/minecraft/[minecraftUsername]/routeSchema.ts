import authorizeSchema from "./authorize/routeSchema";
import isAuthorizedSchema from "./is-authorized/routeSchema";
import z from "zod";

const schema = {
  "/api/minecraft/:username": {
    output: z.object({
      login: z.string(),
      username: z.string(),
      updatedAt: z.coerce.date(),
      createdAt: z.coerce.date(),
    }),
  },
  ...authorizeSchema,
  ...isAuthorizedSchema,
};

export default schema;
