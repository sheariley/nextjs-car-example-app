import type { PrismaClient } from '@/app/generated/prisma/client'

export type GQLServerContext = {
  dbClient: PrismaClient
}
