import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from './store'
import { selectAuthenticated, selectAuthState, selectPassword } from './auth-selectors'

type AuthThunkConfig = {
  state: RootState
  dispatch: AppDispatch
}

export const SubmitLoginRequestId = 'submittingLogin'

export const submitLogin = createAsyncThunk<boolean, void, AuthThunkConfig>(
  'auth/submitLogin',
  async (_, { getState }) => {
    const state = getState()
    const already = selectAuthenticated(state)
    const password = selectPassword(state)
    if (already) return already

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    })
    return response.ok
  },{
  // disallow concurrent login requests
  condition(_, { getState }) {
    const state = getState()
    const authState = selectAuthState(state)
    if (authState.loginStatus === 'pending' || authState.authenticated) return false
  },
  idGenerator() {
    return SubmitLoginRequestId
  }
})