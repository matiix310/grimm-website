import z from "zod";

const schema = {
  "@post/api/minecraft/:username/authorize": {
    output: z.object({}),
  },
};

export default schema;
