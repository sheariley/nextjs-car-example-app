import 'server-only'

import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@/app/generated/prisma/client'
import { CarDetailCreateInputSchema } from '@/validation/schemas/car-detail'
import { CarDetailFeatureCreateInputSchema } from '@/validation/schemas/car-detail-feature'
import { CarFeatureCreateInputSchema } from '@/validation/schemas/car-feature'
import { CarMakeCreateInputSchema } from '@/validation/schemas/car-make'
import { CarModelCreateInputSchema } from '@/validation/schemas/car-model'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
}).$extends({
  query: {
    carMake: {
      create({ args, query }) {
        args.data = CarMakeCreateInputSchema.parse(args.data)
        return query(args)
      },
      update({ args, query }) {
        args.data = CarMakeCreateInputSchema.partial().parse(args.data)
        return query(args)
      },
      updateMany({ args, query }) {
        args.data = CarMakeCreateInputSchema.partial().parse(args.data)
        return query(args)
      },
      upsert({ args, query }) {
        args.create = CarMakeCreateInputSchema.parse(args.create)
        args.update = CarMakeCreateInputSchema.partial().parse(args.update)
        return query(args)
      }
    },
    carModel: {
      create({ args, query }) {
        args.data = CarModelCreateInputSchema.parse(args.data)
        return query(args)
      },
      update({ args, query }) {
        args.data = CarModelCreateInputSchema.partial().parse(args.data)
        return query(args)
      },
      updateMany({ args, query }) {
        args.data = CarModelCreateInputSchema.partial().parse(args.data)
        return query(args)
      },
      upsert({ args, query }) {
        args.create = CarModelCreateInputSchema.parse(args.create)
        args.update = CarModelCreateInputSchema.partial().parse(args.update)
        return query(args)
      }
    },
    carFeature: {
      create({ args, query }) {
        args.data = CarFeatureCreateInputSchema.parse(args.data)
        return query(args)
      },
      update({ args, query }) {
        args.data = CarFeatureCreateInputSchema.partial().parse(args.data)
        return query(args)
      },
      updateMany({ args, query }) {
        args.data = CarFeatureCreateInputSchema.partial().parse(args.data)
        return query(args)
      },
      upsert({ args, query }) {
        args.create = CarFeatureCreateInputSchema.parse(args.create)
        args.update = CarFeatureCreateInputSchema.partial().parse(args.update)
        return query(args)
      }
    },
    carDetailFeature: {
      create({ args, query }) {
        args.data = CarDetailFeatureCreateInputSchema.parse(args.data)
        return query(args)
      },
      update({ args, query }) {
        args.data = CarDetailFeatureCreateInputSchema.partial().parse(args.data)
        return query(args)
      },
      updateMany({ args, query }) {
        args.data = CarDetailFeatureCreateInputSchema.partial().parse(args.data)
        return query(args)
      },
      upsert({ args, query }) {
        args.create = CarDetailFeatureCreateInputSchema.parse(args.create)
        args.update = CarDetailFeatureCreateInputSchema.partial().parse(args.update)
        return query(args)
      }
    },
    carDetail: {
      create({ args, query }) {
        args.data = CarDetailCreateInputSchema.parse(args.data)
        return query(args)
      },
      update({ args, query }) {
        args.data = CarDetailCreateInputSchema.partial().parse(args.data)
        return query(args)
      },
      updateMany({ args, query }) {
        args.data = CarDetailCreateInputSchema.partial().parse(args.data)
        return query(args)
      },
      upsert({ args, query }) {
        args.create = CarDetailCreateInputSchema.parse(args.create)
        args.update = CarDetailCreateInputSchema.partial().parse(args.update)
        return query(args)
      }
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
