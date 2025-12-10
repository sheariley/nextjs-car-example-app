import type { QueryResolvers } from '@/graphql/generated/types.generated'

export const carModels: NonNullable<QueryResolvers['carModels']> = async (_parent, _arg, _ctx) => {
  return _ctx.dbClient.carModel.findMany()
}
