import React from 'react'

import { CarDetail } from '@/types/car-detail'
import { CarDetailFeature } from '@/types/car-detail-feature'
import { CarFeature } from '@/types/car-feature'
import { CarMake } from '@/types/car-make'
import { CarModel } from '@/types/car-model'

import carDetailFeatureRows from '@/mock-data/car-detail-features.json'
import carDetailRows from '@/mock-data/car-details.json'
import carFeatureRows from '@/mock-data/car-features.json'
import carMakeRows from '@/mock-data/car-makes.json'
import carModelRows from '@/mock-data/car-models.json'
import { CarDataApiClient } from './car-data-api-client.type'

async function getCarDetails(): Promise<CarDetail[]> {
  // Fetch data from your API here.
  return (carDetailRows as CarDetail[]).map(carDetail => ({
    ...carDetail,
    CarMake: (carMakeRows as CarMake[]).find(make => make.id === carDetail.carMakeId),
    CarModel: (carModelRows as CarModel[]).find(model => model.id === carDetail.carModelId),
    CarDetailFeatures: (carDetailFeatureRows as CarDetailFeature[])
      .filter(m2m => m2m.carDetailId === carDetail.id)
      .map(m2m => ({
        ...m2m,
        CarFeature: (carFeatureRows as CarFeature[]).find(feature => feature.id === m2m.featureId)
      }))
  }))
}

const useCarDataApiClient = (): CarDataApiClient => {
  // should never recompute the instance because its a mock client and has no config props
  return React.useMemo(() => ({
    getCarDetails
    ,
    // Return all car makes from the mock JSON
    async getCarMakes() {
      return carMakeRows as CarMake[]
    },
    // Return all car models from the mock JSON
    async getCarModels() {
      return carModelRows as CarModel[]
    }
  }), [])
}

export default useCarDataApiClient;