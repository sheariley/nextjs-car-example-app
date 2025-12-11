import { createSelector } from '@reduxjs/toolkit'

import { RootState } from './store'

export const selectAuthState = createSelector(
  (state: RootState) => state.auth,
  state => ({...state})
)

export const selectPassword = createSelector(
  (state: RootState) => state.auth,
  state => state.password
)
