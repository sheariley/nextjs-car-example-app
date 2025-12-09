import prisma from '@/lib/prisma'
import type { QueryResolvers } from './../../../../../app/generated/gql/types.generated'

export const carMakes: NonNullable<QueryResolvers['carMakes']> = async () => {
  return prisma.carMake.findMany()
}
