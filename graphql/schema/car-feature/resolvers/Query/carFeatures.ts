import type { QueryResolvers } from '@/graphql/generated/types.generated'
import type { GQLServerContext } from '@/graphql/server/context.type'

export const carFeatures: NonNullable<QueryResolvers<GQLServerContext>['carFeatures']> = async (_parent, _arg, _ctx) => {
  return _ctx.dbClient.carFeature.findMany()
}
