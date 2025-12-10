import type { MutationResolvers } from '@/graphql/generated/types.generated'

export const deleteCarDetails: NonNullable<MutationResolvers['deleteCarDetails']> = async (_parent, _arg, _ctx) => {
  const result = await _ctx.dbClient.$transaction([
    _ctx.dbClient.carDetailFeature.deleteMany({
      where: { carDetailId: { in: _arg.ids } }
    }),
    _ctx.dbClient.carDetail.deleteMany({
      where: { id: { in: _arg.ids } }
    })
  ])

  return result[1].count
}
