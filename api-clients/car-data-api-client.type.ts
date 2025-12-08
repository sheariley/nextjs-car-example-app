import { CarDetail } from '@/types/car-detail'
import { CarFeature } from '@/types/car-feature'
import { CarMake } from '@/types/car-make'
import { CarModel } from '@/types/car-model'

export type CarDataApiClient = {
  getCarDetails(): Promise<CarDetail[]>
  getCarDetail(id: string): Promise<CarDetail | null | undefined>
  getCarMakes(): Promise<CarMake[]>
  getCarModels(): Promise<CarModel[]>
  getCarFeatures(): Promise<CarFeature[]>
}
