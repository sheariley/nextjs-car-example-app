import prisma from '@/lib/prisma'
import type { QueryResolvers } from './../../../../../app/generated/gql/types.generated'

export const carFeatures: NonNullable<QueryResolvers['carFeatures']> = async () => {
  return prisma.carFeature.findMany()
}
