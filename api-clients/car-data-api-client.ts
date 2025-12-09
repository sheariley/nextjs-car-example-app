import React from 'react'

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import fetch from 'cross-fetch'

import { graphql } from '@/app/generated/gql'
import { CarDataApiClient } from './car-data-api-client.type'

import { CarDetail } from '@/types/car-detail'
import { CarFeature } from '@/types/car-feature'
import { CarMake } from '@/types/car-make'
import { CarModel } from '@/types/car-model'

const GET_CAR_DETAILS = graphql(/* GraphQL */ `
  query GetCarDetails {
    carDetails {
      id
      year
      carMakeId
      carModelId
      CarMake { id name }
      CarModel { id name carMakeId }
      CarDetailFeatures { carDetailId featureId CarFeature { id name } }
    }
  }
`)

const GET_CAR_DETAIL = graphql(/* GraphQL */ `
  query GetCarDetail($id: ID!) {
    carDetail(id: $id) {
      id
      year
      carMakeId
      carModelId
      CarMake { id name }
      CarModel { id name carMakeId }
      CarDetailFeatures { carDetailId featureId CarFeature { id name } }
    }
  }
`)

const GET_CAR_MAKES = graphql(/* GraphQL */ `
  query GetCarMakes { carMakes { id name } }
`)

const GET_CAR_MODELS = graphql(/* GraphQL */ `
  query GetCarModels { carModels { id name carMakeId } }
`)

const GET_CAR_FEATURES = graphql(/* GraphQL */ `
  query GetCarFeatures { carFeatures { id name } }
`)

async function getCarDetails(client: ApolloClient): Promise<CarDetail[]> {
  const { data } = await client.query({ query: GET_CAR_DETAILS })
  return data?.carDetails || []
}

async function getCarDetail(client: ApolloClient, id: string): Promise<CarDetail | null | undefined> {
  const { data } = await client.query({ query: GET_CAR_DETAIL, variables: { id } })
  return data?.carDetail ?? null
}

async function getCarMakes(client: ApolloClient): Promise<CarMake[]> {
  const { data } = await client.query({ query: GET_CAR_MAKES })
  return data?.carMakes ?? []
}

async function getCarModels(client: ApolloClient): Promise<CarModel[]> {
  const { data } = await client.query({ query: GET_CAR_MODELS })
  return data?.carModels ?? []
}

async function getCarFeatures(client: ApolloClient): Promise<CarFeature[]> {
  const { data } = await client.query({ query: GET_CAR_FEATURES })
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