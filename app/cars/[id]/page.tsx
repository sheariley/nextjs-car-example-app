import { CarDetailView } from './car-detail-view'

type CarDetailViewProps = {
  params: {
    id: string
  }
}

export default async function CarDetailPage({ params }: CarDetailViewProps) {
  const carId = (await params).id

  return (
    <CarDetailView carDetailId={carId} />
  )
}
