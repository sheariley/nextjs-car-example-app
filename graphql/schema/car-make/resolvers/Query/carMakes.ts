import type { QueryResolvers } from '@/graphql/generated/types.generated'

export const carMakes: NonNullable<QueryResolvers['carMakes']> = async (_parent, _arg, _ctx) => {
  return _ctx.dbClient.carMake.findMany()
}
