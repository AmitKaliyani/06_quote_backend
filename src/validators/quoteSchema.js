import z from "zod";

export const quoteSchema = z.object({
  text: z.string("text is required"),
  author: z.string().optional(),
  tags: z.array(z.string()).max(3),
  // status:z.enum(["pending","approved","rejected"])
});
