import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import { Prisma, PrismaClient } from '../app/generated/prisma/client'

import carDetailFeatureRows from '@/mock-data/car-detail-features.json'
import carDetailRows from '@/mock-data/car-details.json'
import carFeatureRows from '@/mock-data/car-features.json'
import carMakeRows from '@/mock-data/car-makes.json'
import carModelRows from '@/mock-data/car-models.json'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
})

const carMakeData: Prisma.CarMakeCreateInput[] = carMakeRows.map(row => ({
  id: row.id,
  name: row.name
}))

async function seedCarMakes() {
  for (const data of carMakeData) {
    await prisma.carMake.create({ data })
  }
}

const carModelData: Prisma.CarModelCreateInput[] = carModelRows.map(row => ({
  id: row.id,
  name: row.name,
  CarMake: { connect: { id: row.carMakeId } }
}))

async function seedCarModels() {
  for (const data of carModelData) {
    await prisma.carModel.create({ data })
  }
}

const carFeatureData: Prisma.CarFeatureCreateInput[] = carFeatureRows.map(row => ({
  id: row.id,
  name: row.name
}))

async function seedCarFeatureData() {
  for (const data of carFeatureData) {
    await prisma.carFeature.create({ data })
  }
}

const carDetailData: Prisma.CarDetailCreateInput[] = carDetailRows.map(row => ({
  id: row.id,
  year: row.year,
  CarMake: { connect: { id: row.carMakeId } },
  CarModel: { connect: { id: row.carModelId } }
}))

async function seedCarDetailData() {
  for (const data of carDetailData) {
    await prisma.carDetail.create({ data })
  }
}

const carDetailFeatureData: Prisma.CarDetailFeatureCreateInput[] = carDetailFeatureRows.map(row => ({
  CarDetail: { connect: { id: row.carDetailId } },
  CarFeature: { connect: { id: row.featureId } }
}))

async function seedCarDetailFeatureData() {
  for (const data of carDetailFeatureData) {
    await prisma.carDetailFeature.create({ data })
  }
}

export async function main() {
  await seedCarMakes()
  await seedCarModels()
  await seedCarFeatureData()
  await seedCarDetailData()
  await seedCarDetailFeatureData()
}

main()
