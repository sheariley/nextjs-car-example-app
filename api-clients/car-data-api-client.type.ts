import { CarDetail } from '@/types/car-detail'
import { CarMake } from '@/types/car-make'
import { CarModel } from '@/types/car-model'

export type CarDataApiClient = {
  getCarDetails(): Promise<CarDetail[]>
  // list available car makes (sourced from car-makes.json)
  getCarMakes(): Promise<CarMake[]>
  // list available car models (sourced from car-models.json)
  getCarModels(): Promise<CarModel[]>
}
