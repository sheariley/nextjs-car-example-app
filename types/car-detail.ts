import * as z from 'zod'

import { CarDetailSchema } from '@/validation/schemas/car-detail'

export type CarDetail = z.infer<typeof CarDetailSchema>
