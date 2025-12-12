'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { authActions, authSelectors, useAppDispatch, useAppSelector } from '@/lib/store'
import { LogInIcon } from 'lucide-react'

export default function LoginForm() {
  const dispatch = useAppDispatch()
  const passwordValue = useAppSelector(authSelectors.selectPassword)

  const handlePasswordChange = (value: string) => {
    dispatch(authActions.setPassword(value))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // For now just prevent submit — authentication handled elsewhere
  }

  return (
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
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="submit"
                variant="default"
                aria-label="Login"
                title="Login"
                disabled={!passwordValue}
              >
                Login <LogInIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </CardContent>
    </Card>
  )
}
