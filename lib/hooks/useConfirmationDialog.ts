import React from 'react'

import {
  confirmationDialogActions,
  ConfirmationDialogOpenOptions,
  ConfirmationDialogResultType,
  confirmationDialogSelectors,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store'

export type ConfirmationDialogResultCallback = (result: ConfirmationDialogResultType) => void

export function useConfirmationDialog() {
  const dispatch = useAppDispatch()
  const dialogResult = useAppSelector(confirmationDialogSelectors.selectConfirmationDialogResult)
  const resultPromiseRef = React.useRef<PromiseWithResolvers<ConfirmationDialogResultType>>(null)

  const closeDialog = React.useCallback(() => {
    resultPromiseRef.current = null
    dispatch(confirmationDialogActions.resetDialog())
  }, [dispatch])

  React.useEffect(() => {
    if (dialogResult !== null && resultPromiseRef.current) {
      resultPromiseRef.current.resolve(dialogResult)
      closeDialog()
    }
  }, [dialogResult, dispatch, closeDialog])

  const showDialog = React.useCallback((options: ConfirmationDialogOpenOptions): Promise<ConfirmationDialogResultType> => {
    const deferred = Promise.withResolvers<ConfirmationDialogResultType>()

    resultPromiseRef.current = deferred
    dispatch(confirmationDialogActions.openDialog(options))

    return deferred.promise
  }, [dispatch])

  return {
    showDialog,
    closeDialog
  }
}
