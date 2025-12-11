import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type AuthSliceState = {
  password: string | null
}

export const initialState: AuthSliceState = {
  password: null
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPassword(state, { payload }: PayloadAction<string>) {
      state.password = payload
    }
  }
})

export const authActions = authSlice.actions
