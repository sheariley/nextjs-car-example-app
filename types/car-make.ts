import * as z from 'zod'
import { CarModelSchema } from './car-model'

export const CarMakeMaxNameLength = 64

export const CarMakeSchema = z.object({
  id: z.uuidv4(),
  name: z.string({ error: 'Name is required' })
    .max(CarMakeMaxNameLength, { error: `Max length is ${CarMakeMaxNameLength}` }),
  
  // nav props
  CarModels: z.array(CarModelSchema)
    .optional()
})

export type CarMake = z.infer<typeof CarMakeSchema>
