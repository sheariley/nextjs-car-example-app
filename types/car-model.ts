import * as z from 'zod'

import { CarModelSchema } from '@/validation/schemas/car-model'

export type CarModel = z.infer<typeof CarModelSchema>
