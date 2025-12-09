import React from 'react'

import { CarDataApiClient } from './car-data-api-client.type'

import { CarDetail } from '@/types/car-detail'
import { CarFeature } from '@/types/car-feature'
import { CarMake } from '@/types/car-make'
import { CarModel } from '@/types/car-model'

import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client'
import fetch from 'cross-fetch'

const GET_CAR_DETAILS = gql`
  query GetCarDetails {
    getCarDetails {
      id
      year
      carMakeId
      carModelId
      carMake { id name }
      carModel { id name }
      features { id name }
    }
  }
`

const GET_CAR_DETAIL = gql`
  query GetCarDetail($id: ID!) {
    getCarDetail(id: $id) {
      id
      year
      carMakeId
      carModelId
      carMake { id name }
      carModel { id name }
      features { id name }
    }
  }
`

const GET_CAR_MAKES = gql`
  query GetCarMakes { getCarMakes { id name } }
`

const GET_CAR_MODELS = gql`
  query GetCarModels { getCarModels { id name carMakeId } }
`

const GET_CAR_FEATURES = gql`
  query GetCarFeatures { getCarFeatures { id name } }
`

async function getCarDetails(client: ApolloClient): Promise<CarDetail[]> {
  const { data } = await client.query<CarDetail[]>({ query: GET_CAR_DETAILS })
  return data ?? []
}

async function getCarDetail(client: ApolloClient, id: string): Promise<CarDetail | null | undefined> {
  const { data } = await client.query<CarDetail>({ query: GET_CAR_DETAIL, variables: { id } })
  return data ?? null
}

async function getCarMakes(client: ApolloClient): Promise<CarMake[]> {
  const { data } = await client.query<CarMake[]>({ query: GET_CAR_MAKES })
  return data ?? []
}

async function getCarModels(client: ApolloClient): Promise<CarModel[]> {
  const { data } = await client.query<CarModel[]>({ query: GET_CAR_MODELS })
  return data ?? []
}

async function getCarFeatures(client: ApolloClient): Promise<CarFeature[]> {
  const { data } = await client.query<CarFeature[]>({ query: GET_CAR_FEATURES })
  return data ?? []
}

const useCarDataApiClient = (): CarDataApiClient => {
  // should never recompute the instance because its a mock client and has no config props
  return React.useMemo(() => {
    const client = new ApolloClient({
      link: createHttpLink({ uri: '/api/graphql', fetch }),
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