import { PrismaClient } from '../lib/generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'

// For Neon serverless environments (Vercel, Cloudflare Workers, etc.)
const connectionString = process.env.DATABASE_URL!

const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

// For development environments, you can use the standard client
// const prisma = new PrismaClient()

export default prisma 