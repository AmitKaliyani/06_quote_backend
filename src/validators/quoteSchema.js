import z from 'zod'

export const quoteSchema = z.object({
    text:z.string("text is required"),
    tags:z.array(z.string()).min(5),
    // status:z.enum(["pending","approved","rejected"]) 
})