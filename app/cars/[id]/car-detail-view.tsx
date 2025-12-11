'use client'

import { useLazyQuery, useMutation } from '@apollo/client/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftCircle, ImageIcon, Pencil, SaveIcon, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { validate as uuidValidate } from 'uuid'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Item, ItemGroup } from '@/components/ui/item'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CREATE_CAR_DETAIL,
  GET_CAR_DETAIL,
  GET_CAR_FEATURES,
  GET_CAR_MAKES,
  GET_CAR_MODELS,
  UPDATE_CAR_DETAIL,
} from '@/graphql/operations'
import { cn, toggleArrayValue } from '@/lib/utils'
import { CarDetail, CarDetailCreateInput } from '@/types/car-detail'
import { CarDetailCreateInputSchema } from '@/validation/schemas/car-detail'

export type CarDetailViewProps = React.ComponentProps<'div'> & {
  carDetailId: string
}

const TOAST_ID_SAVING = 'saving'

export function CarDetailView({ carDetailId, className, ...props }: CarDetailViewProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const router = useRouter()

  const [fetchCarDetails, { loading: loadingDetails, error: loadError, data: { carDetail } = {} }] =
    useLazyQuery(GET_CAR_DETAIL)
  const [fetchMakes, { loading: loadingMakes, error: makesLoadingError, data: allMakes }] = useLazyQuery(GET_CAR_MAKES)
  const [fetchModels, { loading: loadingModels, error: modelsLoadingError, data: allModels }] =
    useLazyQuery(GET_CAR_MODELS)
  const [fetchFeatures, { loading: loadingFeatures, error: featuresLoadingError, data: allFeatures }] =
    useLazyQuery(GET_CAR_FEATURES)

  const anyOptionsLoadingError = makesLoadingError || modelsLoadingError || featuresLoadingError

  const [createCarDetail, { loading: creatingCarDetail }] = useMutation(CREATE_CAR_DETAIL)
  const [updateCarDetail, { loading: updatingCarDetail }] = useMutation(UPDATE_CAR_DETAIL)

  const saving = creatingCarDetail || updatingCarDetail

  const form = useForm<CarDetailCreateInput>({
    resolver: zodResolver(CarDetailCreateInputSchema),
    defaultValues: carDetail || {
      year: new Date().getFullYear(),
      featureIds: [],
    },
  })

  // Must be invoked before render to subscribe to changes
  const {
    formState: { isDirty, isValid },
  } = form

  const formValues = form.watch()

  React.useEffect(() => {
    // if a valid UUID was passed in the props, try to load the CarDetail record using it.
    if (uuidValidate(carDetailId)) {
      async function fetchDetails() {
        try {
          const loadResult = await fetchCarDetails({
            variables: { id: carDetailId },
          })
  
          if (!loadResult.error && !loadResult.data?.carDetail) {
            return notFound()
          }
        } catch {
          // swallow it (ignores operation canceled error)
        }
      }

      fetchDetails()
    } else if (carDetailId.toUpperCase() !== 'NEW') {
      return notFound()
    } else {
      setIsEditing(true)
    }
  }, [carDetailId, fetchCarDetails])

  // auto-load data needed for editing (dropdown options)
  React.useEffect(() => {
    if (isEditing) {
      if (!allMakes?.carMakes?.length) fetchMakes()
      if (!allModels?.carModels?.length) fetchModels()
      if (!allFeatures?.carFeatures?.length) fetchFeatures()
    }
  }, [isEditing, allMakes, allModels, allFeatures, fetchMakes, fetchModels, fetchFeatures])

  if (loadError || anyOptionsLoadingError) {
    return (
      <div className={cn('container m-auto py-8', className)} {...props}>
        <Alert variant="destructive">
          <AlertTitle>
            <div className="flex items-center gap-2">
              <TriangleAlert /> <span>An Error Occurred</span>
            </div>
          </AlertTitle>
          <AlertDescription className="pl-8">
            <div className="w-full">{(loadError || anyOptionsLoadingError)!.message}</div>
            <div className="flex w-full justify-center">
              <Button variant="link" size="sm" asChild>
                <Link href="/cars">
                  <ArrowLeftCircle /> Back to list
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  function dismissSavingIndicator() {
    toast.dismiss(TOAST_ID_SAVING)
  }

  function showSavingIndicator() {
    toast.loading('Saving car...', { id: TOAST_ID_SAVING })
  }

  function commitFormState(data: CarDetail) {
    form.reset({
      carMakeId: data.carMakeId,
      carModelId: data.carModelId,
      year: data.year,
      featureIds: data.CarDetailFeatures?.map(x => x.featureId) || [],
    })
  }

  function indicateSaveError(description = 'Failed to save the car.') {
    toast.error('An error occurred', { description })
  }

  function indicateSaveSuccess() {
    toast.success('Car saved!', { description: 'The new car was saved successfully!' })
  }

  async function submitUpdate(data: CarDetailCreateInput) {
    showSavingIndicator()

    try {
      const result = await updateCarDetail({ variables: { ...data, id: carDetailId } })
      dismissSavingIndicator()
      if (result.error) {
        indicateSaveError()
      } else if (result.data) {
        commitFormState(result.data.updateCarDetail)
        indicateSaveSuccess()
        setIsEditing(false)
      }
    } finally {
      dismissSavingIndicator()
    }
  }

  async function submitCreate(data: CarDetailCreateInput) {
    showSavingIndicator()

    try {
      const result = await createCarDetail({ variables: { ...data } })
      dismissSavingIndicator()
      if (result.error) {
        indicateSaveError()
      } else if (result.data) {
        commitFormState(result.data.createCarDetail)
        indicateSaveSuccess()
        setIsEditing(false)
        router.replace(`/cars/${result.data.createCarDetail.id}`)
      }
    } finally {
      dismissSavingIndicator()
    }
  }

  function onSubmit(data: CarDetailCreateInput) {
    if (uuidValidate(carDetailId)) {
      submitUpdate(data)
    } else {
      submitCreate(data)
    }
  }

  function toggleIsEditing() {
    if (carDetail) commitFormState(carDetail)
    setIsEditing(!isEditing)
  }

  return (
    <div className={cn('container mx-auto space-y-6 py-8', className)} {...props}>
      <div className="flex items-start justify-between gap-4">
        {!isEditing ? (
          loadingDetails || !carDetail ? (
            <div className="space-y-2">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-semibold">
                {carDetail.CarMake?.name ?? 'Unknown Make'} {carDetail.CarModel?.name ?? 'Unknown Model'}
              </h1>
              <p className="text-muted-foreground text-sm">Year: {carDetail.year}</p>
            </div>
          )
        ) : (
          <div>
            <h1 className="text-2xl font-semibold">New Car</h1>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cars">
              <ArrowLeftCircle /> Back to list
            </Link>
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
              {loadingDetails || (!isEditing && !carDetail) ? (
                <>
                  <Skeleton className="bg-muted text-muted-foreground flex aspect-video w-full items-center justify-center rounded-md text-sm" />
                </>
              ) : (
                <>
                  <div
                    title="Image Placeholder"
                    className="bg-muted text-muted-foreground flex aspect-video w-full items-center justify-center rounded-md text-sm"
                  >
                    <ImageIcon size={120} className="text-gray-300" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: details and features */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>Core information about this car</CardDescription>
              <CardAction>
                {/* 
                  The buttons below must have their key attr set to diff values. Otherwise,
                  the form will submit when you click the edit button.
                */}
                {!isEditing ? (
                  <Button key="btn-edit" type="button" variant="outline" onClick={toggleIsEditing} disabled={saving}>
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                ) : (
                  <Button key="btn-save" type="submit" disabled={!isDirty || !isValid || saving}>
                    <SaveIcon />
                    Save
                  </Button>
                )}
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {!isEditing ? (
                  <div>
                    <div className="text-muted-foreground text-sm">Make</div>
                    {loadingDetails || !carDetail ? (
                      <Skeleton className="h-[36px] min-w-[120px]" />
                    ) : (
                      <div className="font-medium">{carDetail.CarMake?.name ?? 'Uknown Make'}</div>
                    )}
                  </div>
                ) : (
                  <Controller
                    name="carMakeId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldContent>
                          <FieldLabel>Make</FieldLabel>
                        </FieldContent>
                        {loadingMakes ? (
                          <Skeleton className="h-[36px] min-w-[120px]" />
                        ) : (
                          <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={fieldState.invalid} className="min-w-[120px]">
                              <SelectValue placeholder="Select Make" />
                            </SelectTrigger>
                            <SelectContent position="item-aligned">
                              {allMakes?.carMakes.map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</FieldContent>
                      </Field>
                    )}
                  />
                )}
                {!isEditing ? (
                  <div>
                    <div className="text-muted-foreground text-sm">Model</div>
                    {loadingDetails || !carDetail ? (
                      <Skeleton className="h-[36px] min-w-[120px]" />
                    ) : (
                      <div className="font-medium">{carDetail.CarModel?.name ?? 'Uknown Model'}</div>
                    )}
                  </div>
                ) : (
                  <Controller
                    name="carModelId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldContent>
                          <FieldLabel>Model</FieldLabel>
                        </FieldContent>
                        {loadingModels ? (
                          <Skeleton className="h-[36px] min-w-[120px]" />
                        ) : (
                          <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger aria-invalid={fieldState.invalid} className="min-w-[120px]">
                              <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                            <SelectContent position="item-aligned">
                              {allModels?.carModels
                                .filter(x => x.carMakeId === formValues.carMakeId)
                                .map(item => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                        <FieldContent>{fieldState.invalid && <FieldError errors={[fieldState.error]} />}</FieldContent>
                      </Field>
                    )}
                  />
                )}
                {!isEditing ? (
                  <div>
                    <div className="text-muted-foreground text-sm">Year</div>
                    {loadingDetails || !carDetail ? (
                      <Skeleton className="h-[36px] min-w-[120px]" />
                    ) : (
                      <div className="font-medium">{carDetail.year}</div>
                    )}
                  </div>
                ) : (
                  <Controller
                    name="year"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="year-input">Year</FieldLabel>
                        <Input
                          type="number"
                          id="year-input"
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                          {...field}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>Available features for this car</CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                loadingDetails || !carDetail ? (
                  <FeaturesLoading />
                ) : carDetail.CarDetailFeatures && carDetail.CarDetailFeatures.length > 0 ? (
                  <ItemGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {carDetail.CarDetailFeatures.map((df, i) => (
                      <Item key={i} variant="outline" className="font-medium">
                        {df.CarFeature?.name ?? 'Unknown Feature'}
                      </Item>
                    ))}
                  </ItemGroup>
                ) : (
                  <ItemGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Item variant="muted">No features listed</Item>
                  </ItemGroup>
                )
              ) : loadingFeatures ? (
                <FeaturesLoading />
              ) : (
                <Controller
                  name="featureIds"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <ItemGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {(allFeatures?.carFeatures || []).map(feature => (
                          <Item key={feature.id} variant="outline" className="flex font-medium">
                            <Checkbox
                              id={`feature-checkbox-${feature.id}`}
                              checked={field.value?.includes(feature.id)}
                              onCheckedChange={(_, checked) =>
                                field.onChange(toggleArrayValue(field.value, feature.id, checked === true))
                              }
                            />
                            <FieldLabel
                              htmlFor={`feature-checkbox-${feature.id}`}
                              className="flex-1 cursor-pointer"
                              onClick={() => field.onChange(toggleArrayValue(field.value, feature.id))}
                            >
                              {feature.name}
                            </FieldLabel>
                          </Item>
                        ))}
                      </ItemGroup>
                    </Field>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}

function FeaturesLoading() {
  return (
    <>
      <Skeleton className="h-[54px]" />
      <Skeleton className="h-[54px]" />
      <Skeleton className="h-[54px]" />
      <Skeleton className="h-[54px]" />
    </>
  )
}

