import type { QueryResolvers } from '@/graphql/generated/types.generated'
import type { GQLServerContext } from '@/graphql/server/context.type'

export const carDetails: NonNullable<QueryResolvers<GQLServerContext>['carDetails']> = async (_parent, _arg, _ctx) => {
  const details = await _ctx.dbClient.carDetail.findMany({
    include: {
      CarMake: true,
      CarModel: true,
      CarDetailFeatures: {
        include: { CarFeature: true },
      },
    },
  })

  return details.map(d => ({
    id: d.id,
    year: d.year,
    carMakeId: d.carMakeId,
    carModelId: d.carModelId,

    CarMake: d.CarMake ?? null,
    CarModel: d.CarModel ?? null,
    CarDetailFeatures: d.CarDetailFeatures ?? [],
  }))
}
