import { configureStore } from '@reduxjs/toolkit'
import { confirmationDialogSlice } from './confirmation-dialog-slice'
import { carDataUISlice } from './car-data-ui-slice'

export const makeStore = () => configureStore({
  reducer: {
    confirmationDialog: confirmationDialogSlice.reducer,
    carDataUI: carDataUISlice.reducer
  }
})

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
