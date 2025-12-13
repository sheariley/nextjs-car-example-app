import * as z from 'zod'

import { CarFeatureSchema } from './car-feature'

export const CarDetailFeatureInputSchema = z.object({
  carDetailId: z.uuidv4(),
  featureId: z.uuidv4()
})

export const CarDetailFeatureSchema = z.object({
  ...CarDetailFeatureInputSchema.shape,
  
  // nav props
  CarFeature: CarFeatureSchema.optional().nullable()
})
