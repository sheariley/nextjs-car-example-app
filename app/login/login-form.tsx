'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { authActions, authSelectors, submitLogin, useAppDispatch, useAppSelector } from '@/lib/store'
import { LogInIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'

export default function LoginForm() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const passwordValue = useAppSelector(authSelectors.selectPassword)
  const loginStatus = useAppSelector(authSelectors.selectLoginStatus)
  const [redirecting, setRedirecting] = React.useState(false)

  const handlePasswordChange = (value: string) => {
    dispatch(authActions.setPassword(value))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(submitLogin())
    const success = result.payload === true
    if (!success) {
      toast.error('Login Failed!', {
        description: 'Please try again.',
      })
    } else {
      toast.success('Login succeeded!', {
        description: 'Get ready for awesome-sauce!'
      })

      setRedirecting(true)
      // wait for 3 seconds and then redirect
      setTimeout(() => {
        router.replace('/cars')
      }, 3000)
    }
  }

  return (
    <div className="relative">
      <Card className="min-w-md">
        <CardHeader>
          <CardTitle>
            <h1 className="mb-4 text-2xl">Login Required</h1>
          </CardTitle>
          <CardDescription>
            Please login to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                name="password"
                type="password"
                value={passwordValue ?? ''}
                onChange={e => handlePasswordChange(e.target.value)}
                aria-label="Password"
                placeholder="Enter password"
                disabled={redirecting || loginStatus === 'pending'}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="submit"
                  variant="default"
                  aria-label="Login"
                  title="Login"
                  disabled={!passwordValue || loginStatus === 'pending' || redirecting}
                >
                  Login <LogInIcon />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </CardContent>
      </Card>

      {(redirecting || loginStatus === 'pending') && (
        <div className="bg-muted/60 absolute inset-0 z-10 flex flex-col items-center justify-center [--radius:1rem]">
          <Item variant="outline" className="bg-background">
            <ItemMedia>
              <Spinner />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="line-clamp-1">Logging in...</ItemTitle>
            </ItemContent>
          </Item>
        </div>
      )}
    </div>
  )
}
