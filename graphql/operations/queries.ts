import { graphql } from '@/graphql/generated/client'

export const GET_CAR_DETAILS = graphql(/* GraphQL */ `
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

export const GET_CAR_DETAIL = graphql(/* GraphQL */ `
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

export const GET_CAR_MAKES = graphql(/* GraphQL */ `
  query GetCarMakes { carMakes { id name } }
`)

export const GET_CAR_MODELS = graphql(/* GraphQL */ `
  query GetCarModels { carModels { id name carMakeId } }
`)

export const GET_CAR_FEATURES = graphql(/* GraphQL */ `
  query GetCarFeatures { carFeatures { id name } }
`)