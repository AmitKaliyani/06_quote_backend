import z, { email } from 'zod'
 

export const registerUserSchema = z.object({
    email:z.email('Please enter valid email address') ,
    name:z.string("Please enter name"),
    password:z.string("Password is required")
}) 