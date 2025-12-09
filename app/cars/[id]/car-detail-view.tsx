'use client'

import { Pencil, ImageIcon, TriangleAlert, ArrowLeftCircle } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import useCarDataApiClient from '@/api-clients/car-data-api-client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import coerceErrorMessage from '@/lib/coerceErrorMessage'
import { cn } from '@/lib/utils'
import { CarDetail } from '@/types/car-detail'
import { Item, ItemGroup } from '@/components/ui/item'

export type CarDetailViewProps = React.ComponentProps<'div'> & {
  carDetailId: string
}

export function CarDetailView({ carDetailId, className, ...props }: CarDetailViewProps) {
  const dataClient = useCarDataApiClient()
  const [carDetail, setCarDetail] = React.useState<CarDetail | null | undefined>(null)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  
  React.useEffect(() => {
    async function loadCarDetail() {
      try {
        const result = await dataClient.getCarDetail(carDetailId)
        if (!result) return notFound()

        // TODO: Remove me. For testing only!
        setTimeout(() => {
          setCarDetail(result)
        }, 3000)
      } catch (error) {
        const msg: string = coerceErrorMessage(error)
        setLoadError(msg)
      }
    }

    loadCarDetail()
  }, [carDetailId, dataClient])

  if (loadError) {
    return (
      <div className={cn('py-8', className)} {...props}>
        <Alert variant="destructive">
          <AlertTitle>
            <div className="flex gap-2 items-center">
              <TriangleAlert /> <span>An Error Occurred</span>
            </div>
          </AlertTitle>
          <AlertDescription className="pl-8">
            <div className="w-full">{loadError}</div>
            <div className="w-full flex justify-center">
              <Button variant="link" size="sm" asChild>
                <Link href="/cars"><ArrowLeftCircle /> Back to list</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6 py-8', className)} {...props}>
      <div className="flex items-start justify-between gap-4">
        { !carDetail
          ? <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-32"/>
            </div>
          : <div>
              <h1 className="text-2xl font-semibold">{carDetail.CarMake?.name ?? 'Unknown Make'} {carDetail.CarModel?.name ?? 'Unknown Model'}</h1>
              <p className="text-sm text-muted-foreground">Year: {carDetail.year}</p>
            </div>
        }
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cars"><ArrowLeftCircle /> Back to list</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: images placeholder */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Placeholder for future photos</CardDescription>
            </CardHeader>
            <CardContent>
              {
                !carDetail
                ? (<>
                  <Skeleton className="aspect-video w-full rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground" />
                </>)
                : (<>
                  <div title="Image Placeholder" className="aspect-video w-full rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    <ImageIcon size={120} className="text-gray-300" />
                  </div>
                </>)
              }
            </CardContent>
          </Card>
        </div>

        {/* Right: details and features */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>Core information about this car</CardDescription>
              <CardAction>
                <Button variant="outline">
                  <Pencil className="size-4" />
                  Edit
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Make</div>
                  { !carDetail
                    ? <Skeleton className="h-6 w-full" />
                    : <div className="font-medium">{carDetail.CarMake?.name ?? 'Uknown Make'}</div>
                  }
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Model</div>
                  { !carDetail
                    ? <Skeleton className="h-6 w-full" />
                    : <div className="font-medium">{carDetail.CarModel?.name ?? 'Unknown Model'}</div>
                  }
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Year</div>
                  { !carDetail
                    ? <Skeleton className="h-6 w-full" />
                    : <div className="font-medium">{carDetail.year}</div>
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>Available features for this car</CardDescription>
            </CardHeader>
            <CardContent>
              <ItemGroup className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                { !carDetail
                  ? (<>
                    <Skeleton className="h-[54px]" />
                    <Skeleton className="h-[54px]" />
                    <Skeleton className="h-[54px]" />
                    <Skeleton className="h-[54px]" />
                  </>)
                  : (<>
                    {carDetail.CarDetailFeatures && carDetail.CarDetailFeatures.length > 0 ? (
                      carDetail.CarDetailFeatures.map((df, i) => (
                        <Item key={i} variant="outline" className="font-medium">
                          {df.CarFeature?.name ?? 'Feature'}
                        </Item>
                      ))
                    ) : (
                      <Item variant="muted">No features listed</Item>
                    )}
                  </>)
                }
              </ItemGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}