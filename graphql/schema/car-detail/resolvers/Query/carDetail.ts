import type { QueryResolvers } from '@/graphql/generated/types.generated'
import type { GQLServerContext } from '@/graphql/server/context.type'

export const carDetail: NonNullable<QueryResolvers<GQLServerContext>['carDetail']> = async (_parent, _arg, _ctx) => {
  const d = await _ctx.dbClient.carDetail.findUnique({
    where: { id: _arg.id },
    include: {
      CarMake: true,
      CarModel: true,
      CarDetailFeatures: { include: { CarFeature: true } }
    }
  })

  if (!d) return null

  return {
    id: d.id,
    year: d.year,
    carMakeId: d.carMakeId,
    carModelId: d.carModelId,
    
    CarMake: d.CarMake ?? null,
    CarModel: d.CarModel ?? null,
    CarDetailFeatures: d.CarDetailFeatures ?? []
  }
}
