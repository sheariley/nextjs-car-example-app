import { graphql } from '@/graphql/generated/client'

export const CREATE_CAR_DETAIL = graphql(/* GraphQL */`
  mutation CreateCarDetail($input: CarDetailCreateInput!) {
    createCarDetail(input: $input) {
      id,
      carMakeId,
      carModelId,
      year,
      CarMake { id name }
      CarModel { id name carMakeId }
      CarDetailFeatures {
        carDetailId
        featureId
        CarFeature {
          id name
        }
      }
    }
  }
`)

export const UPDATE_CAR_DETAIL = graphql(/* GraphQL */`
  mutation UpdateCarDetail($input: CarDetailUpdateInput!) {
    updateCarDetail(input: $input) {
      id
      carMakeId
      carModelId
      year
      CarModel {
        id
        name
        carMakeId
      }
      CarMake {
        id
        name
      }
      CarDetailFeatures {
        featureId
        carDetailId
        CarFeature {
          id
          name
        }
      }
    }
  }
`)

export const UPDATE_CAR_DETAILS = graphql(/* GraphQL */`
  mutation UpdateCarDetails($input: [CarDetailUpdateInput!]!) {
    updateCarDetails(input: $input) {
      id
      carMakeId
      carModelId
      year
      CarModel {
        id
        name
        carMakeId
      }
      CarMake {
        id
        name
      }
      CarDetailFeatures {
        featureId
        carDetailId
        CarFeature {
          id
          name
        }
      }
    }
  }
`)

export const DELETE_CAR_DETAILS = graphql(/* GraphQL */`
  mutation DeleteCarDetails($ids: [ID!]!) {
    deleteCarDetails(ids: $ids)
  }
`)
