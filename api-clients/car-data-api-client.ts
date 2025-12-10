import React from 'react'

import { ApolloClient } from '@apollo/client'

import { createApolloClient } from '@/app/apollo-client'
import * as gqlOperations from '@/graphql/operations'
import { isTruthy } from '@/lib/functional'
import type { CarDetail, CarDetailCreateInput, CarDetailUpdateInput } from '@/types/car-detail'
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

async function createCarDetail(
  client: ApolloClient,
  input: CarDetailCreateInput
): Promise<CarDetail | null | undefined> {
  const { data } = await client.query({
    query: gqlOperations.CREATE_CAR_DETAIL,
    variables: input,
  })
  return data?.createCarDetail ?? null
}

async function updateCarDetail(
  client: ApolloClient,
  input: CarDetailUpdateInput
): Promise<CarDetail | null | undefined> {
  const { data } = await client.query({
    query: gqlOperations.UPDATE_CAR_DETAIL,
    variables: input,
  })
  return data?.updateCarDetail ?? null
}

async function deleteCarDetails(client: ApolloClient, input: string[]): Promise<number> {
  const { data } = await client.mutate({
    mutation: gqlOperations.DELETE_CAR_DETAILS,
    variables: { ids: input },
    awaitRefetchQueries: true,
    refetchQueries: [{ query: gqlOperations.GET_CAR_DETAILS, fetchPolicy: 'network-only' }],
    update(cache, result) {
      if (result.data?.deleteCarDetails === input.length) {
        const normalizedIds = input
          .map(id => cache.identify({ id, __typename: 'CarDetail' }))
          .filter(isTruthy) as string[]
        normalizedIds.forEach(id => cache.evict({ id }))
        cache.gc()
      }
    },
  })
  return data?.deleteCarDetails || 0
}

const useCarDataApiClient = (): CarDataApiClient => {
  // should never recompute the instance because its a mock client and has no config props
  return React.useMemo(() => {
    const client = createApolloClient()

    return {
      getCarDetails: () => getCarDetails(client),
      getCarDetail: (id: string) => getCarDetail(client, id),
      getCarMakes: () => getCarMakes(client),
      getCarModels: () => getCarModels(client),
      getCarFeatures: () => getCarFeatures(client),

      createCarDetail: (input: CarDetailCreateInput) => createCarDetail(client, input),
      updateCarDetail: (input: CarDetailUpdateInput) => updateCarDetail(client, input),
      deleteCarDetails: (input: string[]) => deleteCarDetails(client, input),
    }
  }, [])
}

export default useCarDataApiClient
