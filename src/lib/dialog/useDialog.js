// @flow
import { useCallback, useContext } from 'react'
import { type DialogProps } from '../../components/common/dialogs/CustomDialog'

// import pino from '../logger/js-logger'
import { ERROR_DIALOG, fireEvent } from '../analytics/analytics'
import { GlobalTogglesContext } from '../contexts/togglesContext'
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
  const { dialogData, setDialog } = useContext(DialogContext)
  const { setDialogBlur } = useContext(GlobalTogglesContext)
  const showDialog = useCallback(
    (data: DialogData) => {
      setDialogBlur(true)
      setDialog({ ...data, visible: true })
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
    (humanError: string, error: Error | ResponseError, dialogProps?: DialogData) => {
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
      const dialogData = { visible: true, title: 'Ooops ...', message, type: 'error', ...dialogProps }
      showDialog(dialogData)
    },
    [showDialog],
  )

  return {
    isDialogShown: dialogData.visible, //TODO:fix this
    showDialog,
    hideDialog,
    showErrorDialog,
    dialogData,
  }
}
