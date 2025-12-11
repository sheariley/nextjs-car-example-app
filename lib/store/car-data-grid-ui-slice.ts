import { createSlice, PayloadAction, WritableDraft } from '@reduxjs/toolkit'

import { CarDetail, ColumnSortInput } from '@/graphql/generated/types.generated'
import { CarModel } from '@/types/car-model'

export type CarDetailFilterablePropKeys = keyof Pick<CarDetail, 'carMakeId' | 'carModelId' | 'CarDetailFeatures'>

export type NumberRangeFilterValues = {
  min?: number | null
  max?: number | null
}

export type CarDataUISliceState = {
  page: number
  pageSize: number
  totalResultCount: number
  sortColumns: ColumnSortInput[]
  makeFilterValues: string[]
  modelFilterValues: string[]
  featureFilterValues: string[]
  yearRangeFilter: NumberRangeFilterValues
}

const initialState: CarDataUISliceState = {
  page: 1,
  pageSize: 20,
  totalResultCount: 1,
  sortColumns: [],
  makeFilterValues: [],
  modelFilterValues: [],
  featureFilterValues: [],
  yearRangeFilter: {},
}

export const carDataGridUISlice = createSlice({
  name: 'carDataGridUI',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    setPageSize(state, action: PayloadAction<number>) {
      resetPagingState(state)
      state.pageSize = action.payload
    },
    setTotalResultCount(state, action: PayloadAction<number>) {
      state.totalResultCount = action.payload
    },
    setSortColumns(state, action: PayloadAction<ColumnSortInput[]>) {
      state.sortColumns = action.payload
    },
    setMakeFilterValues(state, { payload: { values, allModels } }: PayloadAction<{ values: string[], allModels: CarModel[]}>) {
      resetPagingState(state)
      state.makeFilterValues = values
      syncMakeModelFilterValues(state, allModels)
    },
    setModelFilterValues(state, action: PayloadAction<string[]>) {
      resetPagingState(state)
      state.modelFilterValues = action.payload
    },
    setFeatureFilterValues(state, action: PayloadAction<string[]>) {
      resetPagingState(state)
      state.featureFilterValues = action.payload
    },
    setYearRangeFilter(state, action: PayloadAction<NumberRangeFilterValues>) {
      resetPagingState(state)
      state.yearRangeFilter = action.payload
    },
    toggleSelectedCarMakeFilter(
      state,
      { payload: { makeId, allModels } }: PayloadAction<{ makeId: string; allModels: CarModel[] }>
    ) {
      resetPagingState(state)

      let filterMakeIds = state.makeFilterValues || []

      if (filterMakeIds.includes(makeId)) filterMakeIds = filterMakeIds.filter(f => f !== makeId)
      else filterMakeIds = filterMakeIds.concat([makeId])
      state.makeFilterValues = filterMakeIds
      syncMakeModelFilterValues(state, allModels)
    },
    toggleSelectedCarModelFilter: toggleSelectedListFilterOptions('modelFilterValues'),
    toggleSelectedCarFeatureFilter: toggleSelectedListFilterOptions('featureFilterValues'),
    clearAllFilters(state) {
      state.makeFilterValues = []
      state.modelFilterValues = []
      state.featureFilterValues = []
      state.yearRangeFilter = {}
    }
  },
})

export const carDataGridUIActions = carDataGridUISlice.actions

function resetPagingState(state: WritableDraft<CarDataUISliceState>) {
  state.page = 1
  state.totalResultCount = 1
}

function toggleSelectedListFilterOptions(
  stateKey: keyof Pick<WritableDraft<CarDataUISliceState>, 'modelFilterValues' | 'featureFilterValues'>
) {
  return (state: WritableDraft<CarDataUISliceState>, { payload }: PayloadAction<string>) => {
    resetPagingState(state)
    let filterValues = state[stateKey]

    // toggle logic
    if (filterValues.includes(payload)) filterValues = filterValues.filter(ek => ek !== payload)
    else filterValues = filterValues.concat([payload])

    state[stateKey] = filterValues
  }
}

function syncMakeModelFilterValues(state: WritableDraft<CarDataUISliceState>, allModels: CarModel[]) {
  // remove model filter values that are outside the bounds of the selected make filters
  const filterMakeIds = state.makeFilterValues || []
  let filterModelIds = state.modelFilterValues || []
  if (filterModelIds.length && filterMakeIds.length) {
    filterModelIds = allModels
      .filter(m => filterModelIds.includes(m.id) && filterMakeIds.includes(m.carMakeId))
      .map(m => m.id)
  }
  state.modelFilterValues = filterModelIds
}