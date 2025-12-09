import { CarDetail } from '@/types/car-detail'
import { CarFeature } from '@/types/car-feature'
import { CarMake } from '@/types/car-make'
import { CarModel } from '@/types/car-model'
import { CarDetailFilterablePropKeys, CarDetailFilterOptionKey } from './cars-data-table-types'
import { DataGridNumberRangeFilterValues } from './data-grid-number-range-filter'

export function provideListFilterOptions(
  allMakes: CarMake[],
  allModels: CarModel[],
  allFeatures: CarFeature[],
  rows: CarDetail[],
  selectedListFilterOptions: Record<CarDetailFilterablePropKeys, CarDetailFilterOptionKey[]>
) {
  const makeCounts = new Map<string, number>()
  const modelCounts = new Map<string, number>()
  const featureCounts = new Map<string, number>()

  for (const r of rows) {
    makeCounts.set(r.carMakeId, (makeCounts.get(r.carMakeId) ?? 0) + 1)
    modelCounts.set(r.carModelId, (modelCounts.get(r.carModelId) ?? 0) + 1)
    for (const f of r.CarDetailFeatures || []) {
      featureCounts.set(f.featureId, (featureCounts.get(f.featureId) ?? 0) + 1)
    }
  }

  const filterMakeIds = selectedListFilterOptions.carMakeId || []
  const filteredModels = !filterMakeIds.length ? allModels : allModels.filter(m => filterMakeIds.includes(m.carMakeId))

  return {
    carMakeId: allMakes.map(m => ({
      key: m.id,
      label: m.name,
      count: makeCounts.get(m.id) ?? 0,
    })),
    carModelId: filteredModels.map(m => ({
      key: m.id,
      label: m.name,
      count: modelCounts.get(m.id) ?? 0,
    })),
    CarDetailFeatures: allFeatures.map(f => ({
      key: f.id,
      label: f.name,
      count: featureCounts.get(f.id),
    })),
  }
}

export function filterCarsDataTableRows(
  rows: CarDetail[],
  selectedListFilterOptions: Record<CarDetailFilterablePropKeys, CarDetailFilterOptionKey[]>,
  yearRangeFilter: DataGridNumberRangeFilterValues
) {
  return rows.filter(r => {
    for (const [col, optionKeys] of Object.entries(selectedListFilterOptions)) {
      if (!optionKeys || optionKeys.length === 0) continue

      const colKey = col as CarDetailFilterablePropKeys
      if (colKey === 'CarDetailFeatures') {
        if (!r.CarDetailFeatures?.length) return false
        const carFeatureIds = r.CarDetailFeatures.map(x => x.featureId)
        if (!optionKeys.every(featureId => carFeatureIds.includes(featureId as string))) return false
      } else {
        // map column key to actual CarDetail property
        const value = r[colKey]
        if (!optionKeys.includes(String(value)) && !optionKeys.includes(value)) return false
      }
    }
    if (typeof yearRangeFilter.min === 'number' && r.year < yearRangeFilter.min) {
      return false
    }
    if (typeof yearRangeFilter.max === 'number' && r.year > yearRangeFilter.max) {
      return false
    }
    return true
  })
}
