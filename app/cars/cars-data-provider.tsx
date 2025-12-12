'use client'

import React from 'react'
import { ApolloProvider } from '@apollo/client/react'

import { createApolloClient } from '@/app/apollo-client'
import { useAuthGuard } from '@/lib/hooks'
import { redirect } from 'next/navigation'

type CarsDataProviderProps = {
  children: React.ReactNode | React.ReactNode[] | null
}

export function CarsDataProvider({ children }: CarsDataProviderProps) {
  const { isAuthenticated, token } = useAuthGuard()

  if (!isAuthenticated) {
    return redirect('/login')
  }

  const client = createApolloClient(token!)

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  )
}