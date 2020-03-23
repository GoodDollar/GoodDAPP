// @flow
import type { Store } from 'undux'

export const showSidemenu = (store: Store) => {
  store.set('sidemenu')({ visible: true })
}

export const hideSidemenu = (store: Store) => {
  store.set('sidemenu')({ visible: false })
}

export const toggleSidemenu = (store: Store) => {
  store.set('sidemenu')({ visible: !store.get('sidemenu').visible })
}
