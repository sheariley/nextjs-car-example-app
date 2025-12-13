import * as z from 'zod'

import { CarDetailFeatureInputSchema, CarDetailFeatureSchema } from '@/validation/schemas/car-detail-feature'

export type CarDetailFeatureInput = z.infer<typeof CarDetailFeatureInputSchema>

export type CarDetailFeature = z.infer<typeof CarDetailFeatureSchema>
