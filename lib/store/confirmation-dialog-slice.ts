import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ConfirmationDialogResultType = 'confirm' | 'cancel'

export type ConfirmationDialogOpenOptions = {
  title: string
  body: string
}

export type ConfirmationDialogSliceState = {
  open: boolean
  title: string | null
  body: string | null
  result: ConfirmationDialogResultType | null
}

const initialState: ConfirmationDialogSliceState = {
  open: false,
  title: null,
  body: null,
  result: null
}

export const confirmationDialogSlice = createSlice({
  name: 'confirmationDialog',
  initialState,
  reducers: {
    openDialog(state, action: PayloadAction<ConfirmationDialogOpenOptions>) {
      state.title = action.payload.title
      state.body = action.payload.body
      state.open = true
    },
    setResult(state, action: PayloadAction<ConfirmationDialogResultType>) {
      state.result = action.payload
    },
    resetDialog(state) {
      Object.assign(state, initialState)
    },
  },
})

export const confirmationDialogActions = confirmationDialogSlice.actions
