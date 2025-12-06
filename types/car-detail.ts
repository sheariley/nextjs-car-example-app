import * as z from 'zod'

import { CarMakeSchema } from './car-make'
import { CarModelSchema } from './car-model'
import { CarDetailFeatureSchema } from './car-detail-feature'

export const CarDetailSchema = z.object({
  id: z.uuidv4(),
  carMakeId: z.uuidv4(),
  carModelId: z.uuidv4(),
  year: z.number()
    .int()
    .min(1908)
    .max(new Date().getFullYear()),
  
  // nav props
  CarMake: CarMakeSchema.optional(),
  CarModel: CarModelSchema.optional(),
  CarDetailFeatures: z.array(CarDetailFeatureSchema)
    .optional()
})

export type CarDetail = z.infer<typeof CarDetailSchema>
