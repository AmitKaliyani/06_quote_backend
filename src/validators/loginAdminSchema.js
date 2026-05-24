import z from "zod";

export const loginUserSchema = z.object({
  email: z.email("Please enter valid email address"),
  password: z.string("Password is required"),
});
