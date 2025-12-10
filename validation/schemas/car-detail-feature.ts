import * as z from 'zod'

import { CarFeatureSchema } from './car-feature'

export const CarDetailFeatureCreateInputSchema = z.object({
  carDetailId: z.uuidv4(),
  featureId: z.uuidv4()
})

export const CarDetailFeatureSchema = z.object({
  ...CarDetailFeatureCreateInputSchema.shape,
  
  // nav props
  CarFeature: CarFeatureSchema.optional().nullable()
})
