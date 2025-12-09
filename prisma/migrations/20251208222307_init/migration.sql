-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "CarMake" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(64) NOT NULL,

    CONSTRAINT "CarMake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarModel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "carMakeId" UUID NOT NULL,
    "name" VARCHAR(128) NOT NULL,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarFeature" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(128) NOT NULL,

    CONSTRAINT "CarFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarDetail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "carMakeId" UUID NOT NULL,
    "carModelId" UUID NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "CarDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarDetailFeature" (
    "carDetailId" UUID NOT NULL,
    "featureId" UUID NOT NULL,

    CONSTRAINT "CarDetailFeature_pkey" PRIMARY KEY ("carDetailId","featureId")
);

-- CreateIndex
CREATE INDEX "CarModel_carMakeId_idx" ON "CarModel"("carMakeId");

-- CreateIndex
CREATE INDEX "CarDetail_carMakeId_idx" ON "CarDetail"("carMakeId");

-- CreateIndex
CREATE INDEX "CarDetail_carModelId_idx" ON "CarDetail"("carModelId");

-- CreateIndex
CREATE INDEX "CarDetailFeature_featureId_idx" ON "CarDetailFeature"("featureId");

-- AddForeignKey
ALTER TABLE "CarModel" ADD CONSTRAINT "CarModel_carMakeId_fkey" FOREIGN KEY ("carMakeId") REFERENCES "CarMake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarDetail" ADD CONSTRAINT "CarDetail_carMakeId_fkey" FOREIGN KEY ("carMakeId") REFERENCES "CarMake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarDetail" ADD CONSTRAINT "CarDetail_carModelId_fkey" FOREIGN KEY ("carModelId") REFERENCES "CarModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarDetailFeature" ADD CONSTRAINT "CarDetailFeature_carDetailId_fkey" FOREIGN KEY ("carDetailId") REFERENCES "CarDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarDetailFeature" ADD CONSTRAINT "CarDetailFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "CarFeature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
