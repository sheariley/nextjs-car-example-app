import { configureStore } from '@reduxjs/toolkit'
import { confirmationDialogSlice } from './confirmation-dialog-slice'
import { carDataGridUISlice } from './car-data-grid-ui-slice'

export const makeStore = () => configureStore({
  reducer: {
    confirmationDialog: confirmationDialogSlice.reducer,
    carDataGridUI: carDataGridUISlice.reducer
  }
})

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
