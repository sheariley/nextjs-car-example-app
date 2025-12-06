import * as z from 'zod'

export const CarFeatureMaxNameLength = 128

export const CarFeatureSchema = z.object({
  id: z.uuidv4(),
  name: z.string({ error: 'Name is required' })
    .max(CarFeatureMaxNameLength, { error: `Max length is ${CarFeatureMaxNameLength}` })
})

export type CarFeature = z.infer<typeof CarFeatureSchema>
