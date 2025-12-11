import * as z from 'zod'

import { CarMakeSchema } from './car-make'
import { CarModelSchema } from './car-model'
import { CarDetailFeatureSchema } from './car-detail-feature'

export const CarDetailCreateInputSchema = z.object({
  carMakeId: z.uuidv4({ error: 'Required' }),
  carModelId: z.uuidv4({ error: 'Required' }),
  year: z.coerce.number<number>({ error: 'Year must be a number.' })
    .int()
    .min(1908, { error: 'Year must be greater than 1907' })
    .max(new Date().getFullYear(), { error: 'Year cannot be in the future.' }),
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
