import type { QueryResolvers } from '@/graphql/generated/types.generated'
import type { GQLServerContext } from '@/graphql/server/context.type'

export const carMakes: NonNullable<QueryResolvers<GQLServerContext>['carMakes']> = async (_parent, _arg, _ctx) => {
  return _ctx.dbClient.carMake.findMany()
}
