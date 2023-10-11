// @flow
import { useCallback, useContext, useEffect, useRef } from 'react'
import { noop } from 'lodash'
import { t } from '@lingui/macro'

import { type DialogProps } from '../../components/common/dialogs/CustomDialog'

// import pino from '../logger/js-logger'
import { ERROR_DIALOG, fireEvent } from '../analytics/analytics'
import { GlobalTogglesContext } from '../contexts/togglesContext'
import { makePromiseWrapper } from '../utils/async'
import { DialogContext, type DialogData } from './dialogContext'

// const log = pino.child({ from: 'dialogs' })

export const showDialogForError = (
  store: Store,
  setDialogBlur,
  humanError: string,
  error: Error | ResponseError,
  dialogProps?: DialogProps,
) => {}

export const useDialog = () => {
  const { dialogData, setDialog = noop } = useContext(DialogContext)
  const { setDialogBlur } = useContext(GlobalTogglesContext)
  const isDialogShown = !!dialogData.visible
  const whenClosedRef = useRef()

  const onHidden = useCallback(() => {
    whenClosedRef.current.resolve()
    whenClosedRef.current = null
  }, [])

  const showDialog = useCallback(
    (data: DialogData) => {
      const whenClosed = makePromiseWrapper()

      if (whenClosedRef.current) {
        onHidden()
      }

      setDialogBlur(true)
      setDialog({ ...data, visible: true })

      whenClosedRef.current = whenClosed
      return whenClosed.promise
    },
    [setDialog, setDialogBlur],
  )

  const hideDialog = useCallback(
    (data: DialogData) => {
      setDialogBlur(false)
      setDialog({ visible: false })
    },
    [setDialog, setDialogBlur],
  )

  const showErrorDialog = useCallback(
    async (humanError: string, error: Error | ResponseError, dialogProps?: DialogData) => {
      let message = ''

      if (error == null && humanError && typeof humanError !== 'string') {
        error = humanError
        humanError = undefined
      }

      if (error == null && humanError === undefined) {
        message = 'Unknown Error'
      } else if (error == null) {
        message = ''
      } else if (typeof error === 'string') {
        message = error
      } else if (error.response && error.response.data) {
        message = error.response.data.message
      } else if (error.message) {
        message = error.message
      } else if (error.err) {
        message = error.err
      } else if (typeof error === 'object') {
        message = Object.values(error).join('\n')
      } else if (error.length) {
        message = error.join('\n')
      }

      fireEvent(ERROR_DIALOG, { humanError, message })
      message = humanError ? humanError + '\n' + message : message

      await showDialog({
        visible: true,
        title: t`Ooops ...`,
        message,
        type: 'error',
        ...dialogProps,
      })
    },
    [showDialog],
  )

  useEffect(() => {
    if (!isDialogShown && whenClosedRef.current) {
      onHidden()
    }
  }, [isDialogShown, onHidden])

  return {
    isDialogShown, // TODO:fix this
    showDialog,
    hideDialog,
    showErrorDialog,
    dialogData,
  }
}
