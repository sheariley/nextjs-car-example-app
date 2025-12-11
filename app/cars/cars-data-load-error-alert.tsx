import { RefreshCw, TriangleAlert } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function DataLoadErrorAlert() {
  return (
    <Alert variant="destructive">
      <AlertTitle>
        <div className="flex items-center gap-2">
          <TriangleAlert /> <span>An Error Occurred</span>
        </div>
      </AlertTitle>
      <AlertDescription className="pl-8">
        <div className="w-full">
          We couldn&apos;t fetch the data needed for this page. Click Retry to reload the page.
        </div>
        <div className="flex w-full justify-center">
          <Button variant="link" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw /> Retry
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
