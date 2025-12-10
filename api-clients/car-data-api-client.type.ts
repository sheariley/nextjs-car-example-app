import { CarDetail, CarDetailCreateInput, CarDetailUpdateInput } from '@/types/car-detail'
import { CarFeature } from '@/types/car-feature'
import { CarMake } from '@/types/car-make'
import { CarModel } from '@/types/car-model'

export type CarDataApiClient = {
  // queries
  getCarDetails(): Promise<CarDetail[]>
  getCarDetail(id: string): Promise<CarDetail | null | undefined>
  getCarMakes(): Promise<CarMake[]>
  getCarModels(): Promise<CarModel[]>
  getCarFeatures(): Promise<CarFeature[]>

  // mutations
  createCarDetail(input: CarDetailCreateInput): Promise<CarDetail | null | undefined>
  updateCarDetail(input: CarDetailUpdateInput): Promise<CarDetail | null | undefined>
  deleteCarDetails(input: string[]): Promise<number>
}
