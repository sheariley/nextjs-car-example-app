import * as z from 'zod'

import { CarMakeSchema } from './car-make'
import { CarModelSchema } from './car-model'
import { CarDetailFeatureSchema } from './car-detail-feature'

export const CarDetailCreateInputSchema = z.object({
  carMakeId: z.uuidv4(),
  carModelId: z.uuidv4(),
  year: z.number()
    .int()
    .min(1908)
    .max(new Date().getFullYear()),
  featureIds: z.array(z.string())
    .nullable()
    .optional()
})

export const CarDetailUpdateInputSchema = z.object({
  ...CarDetailCreateInputSchema.shape,
  id: z.uuidv4()
})

export const CarDetailSchema = z.object({
  ...CarDetailUpdateInputSchema.omit({ featureIds: true }).shape,

  // nav props
  CarMake: CarMakeSchema
    .nullable()
    .optional(),
  CarModel: CarModelSchema
    .nullable()
    .optional(),
  CarDetailFeatures: z.array(CarDetailFeatureSchema)
    .nullable()
    .optional()
})
