import { gql } from 'graphql-tag'

export const typeDefs = gql`
  type CarMake {
    id: ID!
    name: String!
  }

  type CarModel {
    id: ID!
    name: String!
    carMakeId: ID!
    carMake: CarMake
  }

  type CarFeature {
    id: ID!
    name: String!
  }

  type CarDetailFeature {
    feature: CarFeature!
  }

  type CarDetail {
    id: ID!
    year: Int!
    carMakeId: ID!
    carModelId: ID!
    carMake: CarMake
    carModel: CarModel
    features: [CarFeature!]
  }

  type Query {
    getCarDetails: [CarDetail!]!
    getCarDetail(id: ID!): CarDetail
    getCarMakes: [CarMake!]!
    getCarModels: [CarModel!]!
    getCarFeatures: [CarFeature!]!
  }
`
