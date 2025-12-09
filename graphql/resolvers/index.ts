import prisma from '@/lib/prisma'
import { IResolvers } from '@graphql-tools/utils'

const resolvers: IResolvers = {
  Query: {
    async getCarDetails() {
      const details = await prisma.carDetail.findMany({
        include: {
          CarMake: true,
          CarModel: true,
          CarDetailFeatures: {
            include: { CarFeature: true }
          }
        }
      })

      return details.map(d => ({
        id: d.id,
        year: d.year,
        carMakeId: d.carMakeId,
        carModelId: d.carModelId,
        carMake: d.CarMake ?? null,
        carModel: d.CarModel ?? null,
        carDetailFeatures: d.CarDetailFeatures ?? []
      }))
    },

    async getCarDetail(_, args: { id: string }) {
      const d = await prisma.carDetail.findUnique({
        where: { id: args.id },
        include: {
          CarMake: true,
          CarModel: true,
          CarDetailFeatures: { include: { CarFeature: true } }
        }
      })

      if (!d) return null

      return {
        id: d.id,
        year: d.year,
        carMakeId: d.carMakeId,
        carModelId: d.carModelId,
        carMake: d.CarMake ?? null,
        carModel: d.CarModel ?? null,
        carDetailFeatures: d.CarDetailFeatures ?? []
      }
    },

    async getCarMakes() {
      return prisma.carMake.findMany()
    },

    async getCarModels() {
      return prisma.carModel.findMany()
    },

    async getCarFeatures() {
      return prisma.carFeature.findMany()
    }
  }
}

export default resolvers
