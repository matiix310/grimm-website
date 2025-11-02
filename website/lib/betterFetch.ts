import { createFetch, createSchema } from "@better-fetch/fetch";

import apiSchema from "@/app/api/routeSchema";
import z from "zod";

const schema = createSchema(apiSchema);

export const $fetch = createFetch({
  schema: schema,
});

export type ApiSchema = {
  [path in keyof typeof apiSchema]: {
    [key in keyof (typeof apiSchema)[path]]: z.infer<(typeof apiSchema)[path][key]>;
  };
};
