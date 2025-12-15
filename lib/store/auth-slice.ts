import { createSlice, isFulfilled, isPending, isRejected, PayloadAction } from '@reduxjs/toolkit'

import { submitLogin, SubmitLoginRequestId } from './auth-thunks'
import { LoadingStatus } from './loading-status'

export type AuthSliceState = {
  password: string | null
  authenticated: boolean
  loginStatus: LoadingStatus
}

export const initialState: AuthSliceState = {
  password: null,
  authenticated: false,
  loginStatus: 'idle',
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPassword(state, { payload }: PayloadAction<string>) {
      state.password = payload
    },
  },
  extraReducers(builder) {
    builder
      .addCase(submitLogin.fulfilled, (state, action) => {
        state.authenticated = action.payload
      })
      .addMatcher<
        PayloadAction<
          undefined,
          string,
          {
            requestId: string
            requestStatus: LoadingStatus
          }
        >
      >(
        action => [isPending, isFulfilled, isRejected].some(m => m(action)),
        (state, action) => {
          if (action.meta.requestId === SubmitLoginRequestId) {
            state.loginStatus = action.meta.requestStatus
          }
        }
      )
  },
})

export const authActions = authSlice.actions
