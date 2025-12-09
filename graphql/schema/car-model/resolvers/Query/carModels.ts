import prisma from '@/lib/prisma'
import type { QueryResolvers } from './../../../../../app/generated/gql/types.generated'

export const carModels: NonNullable<QueryResolvers['carModels']> = async () => {
  return prisma.carModel.findMany()
}
