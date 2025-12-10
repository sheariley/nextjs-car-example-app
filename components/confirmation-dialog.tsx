'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import {
  confirmationDialogActions,
  ConfirmationDialogResultType,
  confirmationDialogSelectors,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store'

export interface ConfirmationDialogProps {
  confirmLabel?: string
  cancelLabel?: string
}

export function ConfirmationDialog({ confirmLabel = 'Confirm', cancelLabel = 'Cancel' }: ConfirmationDialogProps) {
  const dispatch = useAppDispatch()
  const dialogState = useAppSelector(confirmationDialogSelectors.selectConfirmationDialogState)

  const handleChoose = (result: ConfirmationDialogResultType) => {
    dispatch(confirmationDialogActions.setResult(result))
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && typeof handleChoose === 'function') {
      handleChoose('cancel')
    }
  }

  return (
    <Dialog open={dialogState.open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <div className="space-y-2">
          <DialogTitle>{dialogState.title}</DialogTitle>
          <DialogDescription>{dialogState.body}</DialogDescription>
        </div>

        <div className="mt-4 flex w-full justify-end gap-2">
          <Button variant="outline" onClick={() => handleChoose?.('cancel')} data-slot="dialog-cancel">
            {cancelLabel}
          </Button>
          <Button onClick={() => handleChoose?.('confirm')} data-slot="dialog-confirm">
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmationDialog
