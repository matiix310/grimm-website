import z from "zod";

const schema = {
  "@post/api/answers/:answerId": {
    input: z.object({ answer: z.string().nonempty() }),
    output: z.object({ success: z.boolean() }),
  },
};

export default schema;
