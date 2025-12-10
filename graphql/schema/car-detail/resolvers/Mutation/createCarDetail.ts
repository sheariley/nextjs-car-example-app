import type { MutationResolvers } from '@/graphql/generated/types.generated'

export const createCarDetail: NonNullable<MutationResolvers['createCarDetail']> = async (_parent, _arg, _ctx) => {
  const result = await _ctx.dbClient.carDetail.create({
    data: {
      carMakeId: _arg.carMakeId,
      carModelId: _arg.carModelId,
      year: _arg.year,
      CarDetailFeatures: {
        create: _arg.featureIds?.map(featureId => ({ featureId }))
      }
    },
    select: {
      id: true,
      carMakeId: true,
      carModelId: true,
      year: true,
      CarMake: { select: { id: true, name: true } },
      CarModel: { select: { id: true, name: true, carMakeId: true } },
      CarDetailFeatures: {
        include: {
          CarFeature: true
        }
      }
    }
  })

  return result
}
