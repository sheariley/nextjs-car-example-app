import type { QueryResolvers } from '@/graphql/generated/types.generated'
import type { GQLServerContext } from '@/graphql/server/context.type'

export const carModels: NonNullable<QueryResolvers<GQLServerContext>['carModels']> = async (_parent, _arg, _ctx) => {
  return _ctx.dbClient.carModel.findMany()
}
