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

export const carDataUISlice = createSlice({
  name: 'carDataUI',
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
    setMakeFilterValues(state, action: PayloadAction<string[]>) {
      resetPagingState(state)
      state.makeFilterValues = action.payload
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

      // remove filter models that are outside the bounds of the selected make filters
      let filterModelIds = state.modelFilterValues || []
      if (filterModelIds.length && filterMakeIds.length) {
        filterModelIds = allModels
          .filter(m => filterModelIds.includes(m.id) && filterMakeIds.includes(m.carMakeId))
          .map(m => m.id)
      }

      state.makeFilterValues = filterMakeIds
      state.modelFilterValues = filterModelIds
    },
    toggleSelectedCarModelFilter: toggleSelectedListFilterOptions('modelFilterValues'),
    toggleSelectedCarFeatureFilter: toggleSelectedListFilterOptions('featureFilterValues')
  },
})

export const carDataUIActions = carDataUISlice.actions

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
