import * as z from 'zod'
import { CarFeatureSchema } from './car-feature'

export const CarDetailFeatureSchema = z.object({
  carDetailId: z.uuidv4(),
  featureId: z.uuidv4(),

  // nav props
  CarFeature: CarFeatureSchema.optional()
})

export type CarDetailFeature = z.infer<typeof CarDetailFeatureSchema>
