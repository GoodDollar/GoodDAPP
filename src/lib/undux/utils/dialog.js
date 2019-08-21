// @flow
import type { Store } from 'undux'
import SimpleStore from '../SimpleStore'
import { type DialogProps } from '../../../components/common/dialogs/CustomDialog'
import pino from '../../logger/pino-logger'
const log = pino.child({ from: 'dialogs' })

export const showDialogForError = (
  store: Store,
  humanError: string,
  error: Error | ResponseError,
  dialogProps?: DialogProps
) => {
  let message = ''

  if (error === undefined && humanError && typeof humanError !== 'string') {
    error = humanError
    humanError = undefined
  }
  if (error === undefined && humanError === undefined) {
    message = 'Unknown Error'
  } else if (error === undefined) {
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

  message = humanError ? humanError + '\n' + message : message
  const dialogData = { visible: true, title: 'Ooops...', message, dismissText: 'OK', type: 'error', ...dialogProps }
  showDialogWithData(store, dialogData)
}

export const showDialogWithData = (store: Store, dialogData: DialogProps) => {
  log.debug('showDialogWithData', { dialogData })
  store.set('currentScreen')({
    ...store.get('currentScreen'),
    dialogData: {
      ...dialogData,
      visible: true,
    },
  })
}

export const hideDialog = (store: Store) => {
  log.debug('hideDialog')

  store.set('currentScreen')({
    ...store.get('currentScreen'),
    dialogData: {
      visible: false,
    },
  })
}

export const useDialog = () => {
  const store = SimpleStore.useStore()
  return [showDialogWithData.bind(null, store), hideDialog.bind(null, store), showDialogForError.bind(null, store)]
}

export const useErrorDialog = () => {
  const store = SimpleStore.useStore()
  return [showDialogForError.bind(null, store), hideDialog.bind(null, store)]
}
