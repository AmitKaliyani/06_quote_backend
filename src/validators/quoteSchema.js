import z from 'zod'

export const quoteSchema = z.object({
    text:z.string("text is required"),
    attributedTo: z.string().optional(),
    tags:z.array(z.string()).max(5),
    // status:z.enum(["pending","approved","rejected"]) 
})