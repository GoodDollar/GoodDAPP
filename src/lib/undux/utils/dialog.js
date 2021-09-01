// @flow
import { useContext } from 'react'
import type { Store } from 'undux'
import SimpleStore, { assertStore } from '../SimpleStore'
import { type DialogProps } from '../../../components/common/dialogs/CustomDialog'
import pino from '../../logger/js-logger'
import { fireEvent } from '../../analytics/analytics'
import { GlobalTogglesContext } from '../../contexts/togglesContext'
const log = pino.get('dialogs')

export const showDialogForError = (
  store: Store,
  setDialogBlur,
  humanError: string,
  error: Error | ResponseError,
  dialogProps?: DialogProps,
) => {
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

  fireEvent('ERROR_DIALOG', { humanError, message })
  message = humanError ? humanError + '\n' + message : message
  const dialogData = { visible: true, title: 'Ooops ...', message, type: 'error', ...dialogProps }
  showDialogWithData(store, setDialogBlur, dialogData)
}

export const showDialogWithData = (store: Store, setDialogBlur, dialogData: DialogProps) => {
  log.debug('showDialogWithData', { dialogData, setDialogBlur })

  if (!assertStore(store, log, 'showDialogWithData failed')) {
    return
  }

  setDialogBlur(true)
  store.set('currentScreen')({
    ...store.get('currentScreen'),
    dialogData: {
      ...dialogData,
      visible: true,
    },
  })
}

export const hideDialog = (store: Store, setDialogBlur) => {
  log.debug('hideDialog')
  setDialogBlur(false)

  if (!assertStore(store, log, 'hideDialog failed')) {
    return
  }

  store.set('currentScreen')({
    ...store.get('currentScreen'),
    dialogData: {
      visible: false,
    },
  })
}

export const useDialog = () => {
  const store = SimpleStore.useStore()
  const { setDialogBlur } = useContext(GlobalTogglesContext)
  return [
    showDialogWithData.bind(null, store, setDialogBlur),
    hideDialog.bind(null, store, setDialogBlur),
    showDialogForError.bind(null, store, setDialogBlur),
  ]
}

export const useErrorDialog = () => {
  const store = SimpleStore.useStore()
  const { setDialogBlur } = useContext(GlobalTogglesContext)
  return [showDialogForError.bind(null, store, setDialogBlur), hideDialog.bind(null, store, setDialogBlur)]
}
