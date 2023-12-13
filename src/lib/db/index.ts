import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { env } from '../config'
neonConfig.fetchConnectionCache = true

const dataBase = "postgresql://jordybrian225:A7fNE0WmIvKy@ep-bold-water-69219359.us-east-2.aws.neon.tech/chatpdf-db?sslmode=require"

if(!dataBase){
    throw new Error('Base de donnée introuvable')
}

const sql = neon(dataBase)

export const db = drizzle(sql)
