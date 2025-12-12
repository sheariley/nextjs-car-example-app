import { createSlice, PayloadAction, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit'

import { LoadingStatus } from './loading-status'
import { submitLogin, SubmitLoginRequestId } from './auth-thunks'
import overSome from 'lodash/overSome'

export type AuthSliceState = {
  password: string | null
  authenticated: boolean
  loginStatus: LoadingStatus
}

export const initialState: AuthSliceState = {
  password: null,
  authenticated: false,
  loginStatus: 'idle'
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPassword(state, { payload }: PayloadAction<string>) {
      state.password = payload
    }
  },
  extraReducers(builder) {
    builder
    .addCase(submitLogin.fulfilled, (state, action) => {
      state.authenticated = action.payload
    })
    .addMatcher(overSome(overSome(isPending, isFulfilled), isRejected), (state, action) => {
      if (action.meta.requestId === SubmitLoginRequestId) {
        state.loginStatus = action.meta.requestStatus
      }
    })
  },
})

export const authActions = authSlice.actions
