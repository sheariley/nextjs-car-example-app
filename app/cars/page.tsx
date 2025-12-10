import { CarsDataProvider } from './cars-data-provider'
import CarsDataTable from './cars-data-table'

export default async function CarsPage() {
  return (
    <CarsDataProvider>
      <CarsDataTable />
    </CarsDataProvider>
  )
}
