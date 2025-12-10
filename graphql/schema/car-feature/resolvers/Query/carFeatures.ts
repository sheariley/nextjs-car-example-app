import type { QueryResolvers } from '@/graphql/generated/types.generated'

export const carFeatures: NonNullable<QueryResolvers['carFeatures']> = async (_parent, _arg, _ctx) => {
  return _ctx.dbClient.carFeature.findMany()
}
