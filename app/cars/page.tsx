import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { CarDetail } from '@/types/car-detail'
import { CarDetailFeature } from '@/types/car-detail-feature'
import { CarFeature } from '@/types/car-feature'
import { CarMake } from '@/types/car-make'
import { CarModel } from '@/types/car-model'

import carDetailRows from '../../mock-data/car-details.json'
import carMakeRows from '../../mock-data/car-makes.json'
import carModelRows from '../../mock-data/car-models.json'
import carFeatureRows from '../../mock-data/car-features.json'
import carDetailFeatureRows from '../../mock-data/car-detail-features.json'

async function getData(): Promise<CarDetail[]> {
  // Fetch data from your API here.
  return (carDetailRows as CarDetail[]).map(carDetail => ({
    ...carDetail,
    CarMake: (carMakeRows as CarMake[]).find(make => make.id === carDetail.carMakeId),
    CarModel: (carModelRows as CarModel[]).find(model => model.id === carDetail.carModelId),
    CarDetailFeatures: (carDetailFeatureRows as CarDetailFeature[])
      .filter(m2m => m2m.carDetailId === carDetail.id)
      .map(m2m => ({
        ...m2m,
        CarFeature: (carFeatureRows as CarFeature[]).find(feature => feature.id === m2m.featureId)
      }))
  }))
}

export default async function CarsPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}