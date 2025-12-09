import * as z from 'zod'

export const CarModelNameMaxLength = 128

export const CarModelCreateInputSchema = z.object({
  id: z.uuidv4().optional(),
  carMakeId: z.uuidv4(),
  name: z.string({ error: 'Name is required' })
    .max(CarModelNameMaxLength, { error: `Max length is ${CarModelNameMaxLength}` })
})

export const CarModelSchema = z.object({
  ...CarModelCreateInputSchema.shape,
  id: CarModelCreateInputSchema.shape.id.nonoptional()
})
