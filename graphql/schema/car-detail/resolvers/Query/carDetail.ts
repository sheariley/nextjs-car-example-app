import type { QueryResolvers } from '@/graphql/generated/types.generated'

export const carDetail: NonNullable<QueryResolvers['carDetail']> = async (_parent, _arg, _ctx) => {
  const d = await _ctx.dbClient.carDetail.findUniqueOrThrow({
    where: { id: _arg.id },
    include: {
      CarMake: true,
      CarModel: true,
      CarDetailFeatures: { include: { CarFeature: true } }
    }
  })

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
