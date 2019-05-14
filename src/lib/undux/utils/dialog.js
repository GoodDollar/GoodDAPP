// @flow
import type { Store } from 'undux'
import GDStore from '../GDStore'
import pino from '../../logger/pino-logger'
const log = pino.child({ from: 'dialogs' })

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
