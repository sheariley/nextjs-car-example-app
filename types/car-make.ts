import * as z from 'zod'

import { CarMakeSchema } from '@/validation/schemas/car-make'

export type CarMake = z.infer<typeof CarMakeSchema>
