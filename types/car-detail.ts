import * as z from 'zod'

import { CarDetailCreateInputSchema, CarDetailSchema, CarDetailUpdateInputSchema } from '@/validation/schemas/car-detail'

export type CarDetailCreateInput = z.infer<typeof CarDetailCreateInputSchema>

export type CarDetailUpdateInput = z.infer<typeof CarDetailUpdateInputSchema>

export type CarDetail = z.infer<typeof CarDetailSchema>
