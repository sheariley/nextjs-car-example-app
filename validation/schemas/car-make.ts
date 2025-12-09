import * as z from 'zod'
import { CarModelSchema } from './car-model'

export const CarMakeMaxNameLength = 64

export const CarMakeCreateInputSchema = z.object({
  id: z.uuidv4().optional(),
  name: z.string({ error: 'Name is required' })
    .max(CarMakeMaxNameLength, { error: `Max length is ${CarMakeMaxNameLength}` })
})

export const CarMakeSchema = z.object({
  ...CarMakeCreateInputSchema.shape,
  id: CarMakeCreateInputSchema.shape.id.nonoptional(),

  // nav props
  CarModels: z.array(CarModelSchema)
    .optional()
})
