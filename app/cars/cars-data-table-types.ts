import { CarDetail } from '@/types/car-detail'

export type CarDetailFilterablePropKeys = keyof Pick<CarDetail, 'carMakeId' | 'carModelId' | 'CarDetailFeatures'>

