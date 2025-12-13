import type { MutationResolvers } from '@/graphql/generated/types.generated'

export const createCarDetail: NonNullable<MutationResolvers['createCarDetail']> = async (_parent, _arg, _ctx) => {
  return await _ctx.dbClient.$transaction(async tx => {
    const createCarDetailResult = await tx.carDetail.create({
      data: {
        carMakeId: _arg.input.carMakeId,
        carModelId: _arg.input.carModelId,
        year: _arg.input.year,
        // CarDetailFeatures: {
        //   create: _arg.featureIds?.map(featureId => ({ featureId }))
        // }
      },
      select: {
        id: true,
        carMakeId: true,
        carModelId: true,
        year: true,
        CarMake: { select: { id: true, name: true } },
        CarModel: { select: { id: true, name: true, carMakeId: true } },
        CarDetailFeatures: {
          select: {
            carDetailId: true,
            featureId: true,
            CarFeature: true
          }
        }
      }
    })
    
    await tx.carDetailFeature.createMany({
      data: _arg.input.featureIds?.map(featureId => ({ carDetailId: createCarDetailResult.id, featureId })) || []
    })
  
    return createCarDetailResult
  })

}
