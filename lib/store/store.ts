import { configureStore } from '@reduxjs/toolkit'
import { confirmationDialogSlice } from './confirmation-dialog-slice'

export const makeStore = () => configureStore({
  reducer: {
    confirmationDialog: confirmationDialogSlice.reducer
  }
})

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
