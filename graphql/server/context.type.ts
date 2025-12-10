import type { PrismaClient } from '@/prisma/generated/client'
import { NextApiRequest, NextApiResponse } from 'next/types'

export type GQLServerContext = {
  req: NextApiRequest
  res: NextApiResponse
  dbClient: PrismaClient
}
