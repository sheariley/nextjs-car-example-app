import type { MutationResolvers } from '@/graphql/generated/types.generated'

export const deleteCarDetail: NonNullable<MutationResolvers['deleteCarDetail']> = async (_parent, _arg, _ctx) => {
  const result = await _ctx.dbClient.carDetail.delete({
    where: { id: _arg.id },
    select: { id: true }
  })

  return result.id === _arg.id
}
