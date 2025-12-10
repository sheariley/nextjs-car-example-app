import type { QueryResolvers } from '@/graphql/generated/types.generated'
import type { CarDetailWhereInput, IntFilter } from '@/prisma/generated/internal/prismaNamespace'

export const carDetails: NonNullable<QueryResolvers['carDetails']> = async (
  _parent,
  _arg,
  _ctx
) => {
  const { page, pageSize, filter } = _arg ?? {}

  const where: CarDetailWhereInput = {}

  // filtering
  if (filter) {
    const { yearMin, yearMax, carMakeIds, carModelIds, featureIds } = filter

    if (yearMin != null || yearMax != null) {
      const yearFilter: IntFilter = {}
      if (yearMin != null) yearFilter.gte = yearMin
      if (yearMax != null) yearFilter.lte = yearMax
      where.year = yearFilter
    }

    if (carMakeIds != null) where.carMakeId = { in: carMakeIds }
    if (carModelIds != null) where.carModelId = { in: carModelIds }

    if (featureIds != null && Array.isArray(featureIds) && featureIds.length > 0) {
      where.CarDetailFeatures = { some: { featureId: { in: featureIds } } }
    }
  }

  // paging
  const MAX_PAGE_SIZE = 100
  let skip: number | undefined
  let take: number | undefined
  if (page != null && pageSize != null) {
    const safePage = Math.max(1, Number(page) || 1)
    const safePageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(pageSize) || 1))
    skip = (safePage - 1) * safePageSize
    take = safePageSize
  }

  const [details, totalCount] = await Promise.all([
    _ctx.dbClient.carDetail.findMany({
      where,
      include: {
        CarMake: true,
        CarModel: true,
        CarDetailFeatures: {
          include: { CarFeature: true },
        },
      },
      ...(skip !== undefined ? { skip } : {}),
      ...(take !== undefined ? { take } : {}),
    }),
    _ctx.dbClient.carDetail.count({ where }),
  ])

  const items = details.map(d => ({
    id: d.id,
    year: d.year,
    carMakeId: d.carMakeId,
    carModelId: d.carModelId,

    CarMake: d.CarMake ?? null,
    CarModel: d.CarModel ?? null,
    CarDetailFeatures: d.CarDetailFeatures ?? [],
  }))

  return {
    items,
    totalCount,
  }
}
