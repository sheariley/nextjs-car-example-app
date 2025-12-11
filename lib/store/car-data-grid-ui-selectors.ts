import { createSelector } from '@reduxjs/toolkit'

import { RootState } from './store'
import { CarDetailFilterInput } from '@/graphql/generated/client/graphql'

export const selectCarDataGridUIState = createSelector(
  (state: RootState) => state.carDataGridUI,
  (state) => ({...state})
)

export const selectPage = createSelector(
  (state: RootState) => state.carDataGridUI,
  state => state.page
)

export const selectPageSize = createSelector(
  (state: RootState) => state.carDataGridUI,
  state => state.pageSize
)

export const selectTotalResultCount = createSelector(
  (state: RootState) => state.carDataGridUI,
  state => state.totalResultCount
)

export const selectPageCount = createSelector(
  (state: RootState) => state.carDataGridUI,
  state => {
    return Math.ceil(Math.max((state.totalResultCount || 0) / state.pageSize, 1))
  }
)

export const selectSortColumns = createSelector(
  (state: RootState) => state.carDataGridUI,
  state => state.sortColumns
)

export const selectMakeFilterValues = createSelector(
  (state: RootState) => state.carDataGridUI,
  state => state.makeFilterValues
)

export const selectModelFilterValues = createSelector(
  (state: RootState) => state.carDataGridUI,
  state => state.modelFilterValues
)

export const selectFeatureFilterValues = createSelector(
  (state: RootState) => state.carDataGridUI,
  state => state.featureFilterValues
)

export const selectYearRangeFilter = createSelector(
  (state: RootState) => state.carDataGridUI,
  state => state.yearRangeFilter
)

export const selectRequestFilter = createSelector(
  (state: RootState) => state.carDataGridUI,
  ({ makeFilterValues, modelFilterValues, featureFilterValues, yearRangeFilter }) => {
    const filterInput: CarDetailFilterInput = {}
    
    filterInput.carMakeIds = makeFilterValues.length
      ? makeFilterValues
      : undefined
    filterInput.carModelIds = modelFilterValues.length
      ? modelFilterValues
      : undefined
    filterInput.featureIds = featureFilterValues

    if (yearRangeFilter) {
      if (yearRangeFilter.min != null) filterInput.yearMin = yearRangeFilter.min
      if (yearRangeFilter.max != null) filterInput.yearMax = yearRangeFilter.max
    }

    return Object.keys(filterInput).length ? filterInput : undefined
  }
)
