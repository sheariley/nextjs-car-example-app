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

async function getCarDetail(id: string) {
  // logic will obviously be different when pulling from actual DB
  const allCars = await getCarDetails()
  const result = allCars.find(x => x.id === id)
  return result
}

async function getCarMakes() {
  return carMakeRows as CarMake[]
}

async function getCarModels() {
  return carModelRows as CarModel[]
}

async function getCarFeatures() {
  return carFeatureRows as CarFeature[]
}

const useCarDataApiClient = (): CarDataApiClient => {
  // should never recompute the instance because its a mock client and has no config props
  return React.useMemo(() => ({
    getCarDetails,
    getCarDetail,
    getCarMakes,
    getCarModels,
    getCarFeatures
  }), [])
}

export default useCarDataApiClient;