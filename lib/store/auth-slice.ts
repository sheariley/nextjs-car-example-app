import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type AuthSliceState = {
  password: string | null
  authenticated: boolean
}

export const initialState: AuthSliceState = {
  password: null,
  authenticated: false
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
