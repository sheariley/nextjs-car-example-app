'use client'

import React from 'react'
import { Provider } from 'react-redux'
import { makeStore } from './store'

const store = makeStore()

function StoreProvider({ children }: React.PropsWithChildren) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}

export default StoreProvider
