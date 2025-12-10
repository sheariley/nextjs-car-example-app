import { createSelector } from '@reduxjs/toolkit'

import { RootState } from './store'

export const selectConfirmationDialogState = createSelector(
  (state: RootState) => state.confirmationDialog,
  (state) => ({...state})
)

export const selectConfirmationDialogResult = createSelector(
  (state: RootState) => state.confirmationDialog,
  state => state.result
)
