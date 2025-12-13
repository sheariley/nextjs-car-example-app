import type { MutationResolvers } from '@/graphql/generated/types.generated'
import { CarDetailFeatureInput } from '@/types/car-detail-feature'

export const updateCarDetails: NonNullable<MutationResolvers['updateCarDetails']> = async (_parent, _arg, _ctx) => {
  
  /* NOTE: I could NOT get the nested createMany or deleteMany to work with prisma.
           So, I had to fetch the existing data first, determine what to delete/add
           and then use separate queries to update all of the data. However, they
           are wrapped in a transaction, so ATOMicty is retained.
  */

  let featuresToDelete: CarDetailFeatureInput[] = []
  let featuresToAdd: CarDetailFeatureInput[] = []

  const inputFeatures = _arg.input.flatMap(x =>
    x.featureIds?.map(featureId => ({ carDetailId: x.id, featureId }) as CarDetailFeatureInput) ?? []
  )

  if (inputFeatures.length) {
    const existing = await _ctx.dbClient.carDetail.findMany({
      where: { id: { in: _arg.input.map(x => x.id) } },
      include: {
        CarDetailFeatures: true,
      },
    })

    const existingFeatures = existing.flatMap(x => x.CarDetailFeatures || [])

    featuresToDelete = !inputFeatures.length
      ? // delete all
        existingFeatures
      : // delete ones that weren't sent in request
        existingFeatures.filter(x => !inputFeatures.some(y => carDetailFeaturesAreEqual(x, y)))

    featuresToAdd = !inputFeatures.length
      ? []
      : inputFeatures.filter(x => !existingFeatures.some(y => carDetailFeaturesAreEqual(x, y)))
  }

  return _ctx.dbClient.$transaction(async tx => {
    if (featuresToDelete.length) {
      await tx.carDetailFeature.deleteMany({
        where: {
          carDetailId: { in: featuresToDelete.map(x => x.carDetailId) },
          featureId: { in: featuresToDelete.map(x => x.featureId) || [] },
        },
      })
    }

    if (featuresToAdd.length) {
      await tx.carDetailFeature.createMany({
        data: featuresToAdd
      })
    }

    const results = await Promise.all(_arg.input.map(input => tx.carDetail.update({
      where: { id: input.id },
      data: {
        carMakeId: input.carMakeId || undefined,
        carModelId: input.carModelId || undefined,
        year: input.year || undefined,
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
            CarFeature: true,
          },
        },
      },
    })))

    return results
  })
}

function carDetailFeaturesAreEqual(a: CarDetailFeatureInput, b: CarDetailFeatureInput) {
  return a.carDetailId === b.carDetailId && a.featureId === b.featureId
}