// @flow
import type { Store } from 'undux'
import SimpleStore from '../SimpleStore'

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
  const store = SimpleStore.useStore()
  return [toggleSidemenu.bind(null, store), hideSidemenu.bind(null, store), showSidemenu.bind(null, store)]
}
