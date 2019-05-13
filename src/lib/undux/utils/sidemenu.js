// @flow
import type { Store } from 'undux'
import GDStore from '../GDStore'
import { showDialogWithData, hideDialog } from './dialog'

export const showSidemenu = (store: Store) => {
  store.set('sidemenu')({ visible: true })
}

export const hideSidemenu = (store: Store) => {
  store.set('sidemenu')({ visible: false })
}

export const toggleSidemenu = (store: Store) => {
  store.set('sidemenu')({ visible: !store.get('sidemenu').visible })
}

export const useSidemenu = () => {
  const store = GDStore.useStore()
  return {
    showDialogWithData: showDialogWithData.bind(null, store),
    hideDialog: hideDialog.bind(null, store),
    showSidemenu: showSidemenu.bind(null, store),
    hideSidemenu: hideSidemenu.bind(null, store),
    toggleSidemenu: toggleSidemenu.bind(null, store)
  }
}
