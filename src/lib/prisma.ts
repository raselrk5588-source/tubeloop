import { PrismaClient } from '../generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
const prismaClientSingleton = () => {
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' })
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = prismaClientSingleton()
// Force reload of Prisma client

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
