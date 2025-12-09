import React from 'react'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import fetch from 'cross-fetch'

import * as gqlOperations from '@/graphql/operations'
import type { CarDetail } from '@/types/car-detail'
import type { CarFeature } from '@/types/car-feature'
import type { CarMake } from '@/types/car-make'
import type { CarModel } from '@/types/car-model'
import type { CarDataApiClient } from './car-data-api-client.type'

async function getCarDetails(client: ApolloClient): Promise<CarDetail[]> {
  const { data } = await client.query({ query: gqlOperations.GET_CAR_DETAILS })
  return data?.carDetails || []
}

async function getCarDetail(client: ApolloClient, id: string): Promise<CarDetail | null | undefined> {
  const { data } = await client.query({ query: gqlOperations.GET_CAR_DETAIL, variables: { id } })
  return data?.carDetail ?? null
}

async function getCarMakes(client: ApolloClient): Promise<CarMake[]> {
  const { data } = await client.query({ query: gqlOperations.GET_CAR_MAKES })
  return data?.carMakes ?? []
}

async function getCarModels(client: ApolloClient): Promise<CarModel[]> {
  const { data } = await client.query({ query: gqlOperations.GET_CAR_MODELS })
  return data?.carModels ?? []
}

async function getCarFeatures(client: ApolloClient): Promise<CarFeature[]> {
  const { data } = await client.query({ query: gqlOperations.GET_CAR_FEATURES })
  return data?.carFeatures ?? []
}

const useCarDataApiClient = (): CarDataApiClient => {
  // should never recompute the instance because its a mock client and has no config props
  return React.useMemo(() => {
    const client = new ApolloClient({
      link: new HttpLink({ uri: '/api/graphql', fetch }),
      cache: new InMemoryCache()
    })

    return {
      getCarDetails: () => getCarDetails(client),
      getCarDetail: (id: string) => getCarDetail(client, id),
      getCarMakes: () => getCarMakes(client),
      getCarModels: () => getCarModels(client),
      getCarFeatures: () => getCarFeatures(client)
    }
  }, [])
}

export default useCarDataApiClient