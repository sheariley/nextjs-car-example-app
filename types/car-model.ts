import * as z from 'zod'

export const CarModelNameMaxLength = 128

export const CarModelSchema = z.object({
  id: z.uuidv4(),
  carMakeId: z.uuidv4(),
  name: z.string({ error: 'Name is required' })
    .max(CarModelNameMaxLength, { error: `Max length is ${CarModelNameMaxLength}` })
})

export type CarModel = z.infer<typeof CarModelSchema>
