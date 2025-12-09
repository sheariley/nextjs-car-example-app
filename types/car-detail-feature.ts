import * as z from 'zod'

import { CarDetailFeatureSchema } from '@/validation/schemas/car-detail-feature'

export type CarDetailFeature = z.infer<typeof CarDetailFeatureSchema>
