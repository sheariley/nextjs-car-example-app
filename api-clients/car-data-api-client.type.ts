import { CarDetail } from '@/types/car-detail'

export type CarDataApiClient = {
  getData(): Promise<CarDetail[]>
}
