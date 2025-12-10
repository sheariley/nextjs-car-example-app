import type { MutationResolvers } from '@/graphql/generated/types.generated'

export const deleteCarDetails: NonNullable<MutationResolvers['deleteCarDetails']> = async (_parent, _arg, _ctx) => {
  const result = await _ctx.dbClient.carDetail.deleteMany({
    where: { id: { in: _arg.ids } },
  })

  return result.count
}
