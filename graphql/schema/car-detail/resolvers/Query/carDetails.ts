import prisma from '@/lib/prisma'
import type { QueryResolvers } from './../../../../../app/generated/gql/types.generated'

export const carDetails: NonNullable<QueryResolvers['carDetails']> = async () => {
  const details = await prisma.carDetail.findMany({
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
