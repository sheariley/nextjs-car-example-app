import type { MutationResolvers } from '@/graphql/generated/types.generated'
import { GraphQLError } from 'graphql/error'

export const updateCarDetail: NonNullable<MutationResolvers['updateCarDetail']> = async (_parent, _arg, _ctx) => {

  /* NOTE: I could NOT get the nested createMany or deleteMany to work with prisma.
           So, I had to fetch the existing data first, determine what to delete/add
           and then use separate queries to update all of the data. However, they
           are wrapped in a transaction, so ATOMicty is retained.
  */

  let featureIdsToDelete: string[] = []
  let featureIdsToAdd: string[] = []

  if (Array.isArray(_arg.input.featureIds)) {
    const existing = await _ctx.dbClient.carDetail.findUniqueOrThrow({
      where: { id: _arg.input.id },
      include: {
        CarDetailFeatures: true
      }
    })
  
    if (!existing) {
      throw new GraphQLError('Record not found', {
        extensions: {
          code: 'NOT_FOUND',
          http: { status: 404 },
        },
      })
    }

    const existingFeatureIds = existing.CarDetailFeatures.map(x => x.featureId)
  
    featureIdsToDelete = !_arg.input.featureIds.length
      // delete all
      ? existingFeatureIds
      // delete ones that weren't sent in request
      : existingFeatureIds.filter(x => !_arg.input.featureIds!.includes(x))

    featureIdsToAdd = !_arg.input.featureIds.length ? [] : _arg.input.featureIds
      .filter(x => !existingFeatureIds.includes(x))
  }

  return _ctx.dbClient.$transaction(async (tx) => {
    if (featureIdsToDelete.length) {
      await tx.carDetailFeature.deleteMany({
        where: {
          carDetailId: _arg.input.id,
          featureId: { in: featureIdsToDelete || [] }
        }
      })
    }
  
    if (featureIdsToAdd.length) {
      await tx.carDetailFeature.createMany({
        data: featureIdsToAdd.map(featureId => ({ carDetailId: _arg.input.id, featureId })) || []
      })
    }
    
    const result = await tx.carDetail.update({
      where: { id: _arg.input.id },
      data: {
        carMakeId: _arg.input.carMakeId || undefined,
        carModelId: _arg.input.carModelId || undefined,
        year: _arg.input.year || undefined
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
  })

}
