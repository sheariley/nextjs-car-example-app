import { CarsDataProvider } from '../cars-data-provider'
import { CarDetailView } from './car-detail-view'

type CarDetailViewProps = {
  params: {
    id: string
  }
}

export default async function CarDetailPage({ params }: CarDetailViewProps) {
  const carId = (await params).id

  return (
    <CarsDataProvider>
      <CarDetailView carDetailId={carId} />
    </CarsDataProvider>
  )
}
