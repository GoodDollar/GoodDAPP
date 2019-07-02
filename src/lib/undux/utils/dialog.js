// @flow
import type { Store } from 'undux'
import GDStore from '../GDStore'
import pino from '../../logger/pino-logger'
const log = pino.child({ from: 'dialogs' })

export const showDialogForError = (store: Store, humanError: string, error: Error | ResponseError) => {
  let message = ''
  if (error === undefined && humanError && typeof humanError !== 'string') {
    error = humanError
    humanError = undefined
  }
  if (error === undefined) {
    message = 'Unknown Error'
  } else if (typeof error === 'string') {
    message = error
  } else if (error.response && error.response.data) {
    message = error.response.data.message
  } else if (error.message) {
    message = error.message
  } else if (error.err) {
    message = error.err
  }

  message = humanError ? humanError + '\n' + message : message
  const dialogData = { visible: true, title: 'Error', message, dismissText: 'OK' }
  showDialogWithData(store, dialogData)
}

export const showDialogWithData = (store: Store, dialogData: {}) => {
  log.debug('showDialogWithData', { dialogData })
  store.set('currentScreen')({
    ...store.get('currentScreen'),
    dialogData: {
      ...dialogData,
      visible: true
    }
  })
}

export const hideDialog = (store: Store) => {
  log.debug('hideDialog')

  store.set('currentScreen')({
    ...store.get('currentScreen'),
    dialogData: {
      visible: false
    }
  })
}

export const useDialog = () => {
  const store = GDStore.useStore()
  return [showDialogWithData.bind(null, store), hideDialog.bind(null, store)]
}

export const useErrorDialog = () => {
  const store = GDStore.useStore()
  return [showDialogForError.bind(null, store), hideDialog.bind(null, store)]
}
