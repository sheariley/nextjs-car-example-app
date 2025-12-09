import * as z from 'zod'

export const CarFeatureMaxNameLength = 128

export const CarFeatureCreateInputSchema = z.object({
  id: z.uuidv4().optional(),
  name: z.string({ error: 'Name is required' })
    .max(CarFeatureMaxNameLength, { error: `Max length is ${CarFeatureMaxNameLength}` })
})

export const CarFeatureSchema = z.object({
  ...CarFeatureCreateInputSchema.shape,
  id: CarFeatureCreateInputSchema.shape.id.nonoptional()
})
