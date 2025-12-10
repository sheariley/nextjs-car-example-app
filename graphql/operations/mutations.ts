import { graphql } from '@/graphql/generated/client'

export const CREATE_CAR_DETAIL = graphql(/* GraphQL */`
  mutation CreateCarDetail($year: Int!, $carMakeId: ID!, $carModelId: ID!, $featureIds: [ID!]) {
    createCarDetail(year: $year, carMakeId: $carMakeId, carModelId: $carModelId, featureIds: $featureIds) {
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
  mutation UpdateCarDetail($id: ID!, $year: Int, $carMakeId: ID, $carModelId: ID, $featureIds: [ID!]) {
    updateCarDetail(id: $id, year: $year, carMakeId: $carMakeId, carModelId: $carModelId, featureIds: $featureIds) {
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

export const DELETE_CAR_DETAIL = graphql(/* GraphQL */`
  mutation DeleteCarDetail($deleteCarDetailId: ID!) {
    deleteCarDetail(id: $deleteCarDetailId)
  }
`)
