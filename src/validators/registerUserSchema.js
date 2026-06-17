import z from "zod";

export const registerUserSchema = z.object({
  email: z.string().email("Please enter valid email address"),
  name: z.string().min(1, "Please enter name"),
  password: z.string().min(1, "Password is required"),
});
