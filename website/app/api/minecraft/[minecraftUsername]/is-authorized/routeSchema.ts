import z from "zod";

const schema = {
  "/api/minecraft/:username/is-authorized": {
    output: z.object({}),
  },
};

export default schema;
