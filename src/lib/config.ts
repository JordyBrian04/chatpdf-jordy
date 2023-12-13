import z from 'zod'

const envConfig = z.object({
    OPENAI_API_KEY : z.string().trim().min(1),
    PINECONE_ENVIRONMENT : z.string().trim().min(1),
    PINECONE_API_KEY : z.string().trim().min(1),
    PINECONE_INDEX_NAME : z.string().trim().min(1),
    INDEX_INIT_TIMEOUT: z.coerce.number().min(1),
    STRIPE_API_KEY : z.string().trim().min(1),
    STRIPE_WEBHOOK_SIGNING_SECRET : z.string().trim().min(1),
    DATABASE_URL : z.string().trim().min(1),
})

export const env = envConfig.parse(process.env)