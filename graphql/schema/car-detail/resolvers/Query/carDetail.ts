import type { QueryResolvers } from './../../../../../app/generated/gql/types.generated'
import prisma from '@/lib/prisma'

export const carDetail: NonNullable<QueryResolvers['carDetail']> = async (_parent, _arg) => {
  const d = await prisma.carDetail.findUnique({
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
