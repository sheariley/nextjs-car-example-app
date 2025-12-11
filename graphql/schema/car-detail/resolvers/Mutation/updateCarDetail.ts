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

  if (Array.isArray(_arg.featureIds)) {
    const existing = await _ctx.dbClient.carDetail.findUniqueOrThrow({
      where: { id: _arg.id },
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
  
    featureIdsToDelete = !_arg.featureIds.length
      // delete all
      ? existingFeatureIds
      // delete ones that weren't sent in request
      : existingFeatureIds.filter(x => !_arg.featureIds!.includes(x))

    featureIdsToAdd = !_arg.featureIds.length ? [] : _arg.featureIds
      .filter(x => !existingFeatureIds.includes(x))
  }

  return _ctx.dbClient.$transaction(async (tx) => {
    if (featureIdsToDelete.length) {
      await tx.carDetailFeature.deleteMany({
        where: {
          carDetailId: _arg.id,
          featureId: { in: featureIdsToDelete || [] }
        }
      })
    }
  
    if (featureIdsToAdd.length) {
      await tx.carDetailFeature.createMany({
        data: featureIdsToAdd.map(featureId => ({ carDetailId: _arg.id, featureId })) || []
      })
    }
    
    const result = await tx.carDetail.update({
      where: { id: _arg.id },
      data: {
        carMakeId: _arg.carMakeId || undefined,
        carModelId: _arg.carModelId || undefined,
        year: _arg.year || undefined
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
