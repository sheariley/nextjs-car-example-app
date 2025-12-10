'use client'

import React from 'react'
import { ApolloProvider } from '@apollo/client/react'

import { createApolloClient } from '@/app/apollo-client'

type CarsDataProviderProps = {
  children: React.ReactNode | React.ReactNode[] | null;
}

const client = createApolloClient()

export function CarsDataProvider({ children }: CarsDataProviderProps) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  )
}