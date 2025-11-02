import z from "zod";

const schema = {
  "/api/ranking/refresh": {
    output: z.object({}),
  },
};

export default schema;
