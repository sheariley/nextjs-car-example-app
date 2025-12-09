import * as z from 'zod'

import { CarFeatureSchema } from '@/validation/schemas/car-feature'

export type CarFeature = z.infer<typeof CarFeatureSchema>
