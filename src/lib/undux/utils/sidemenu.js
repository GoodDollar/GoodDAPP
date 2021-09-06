// @flow
import type { Store } from 'undux'
import { assertStore } from '../SimpleStore'
import pino from '../../logger/js-logger'

const log = pino.child({ from: 'sideMenu' })

export const showSidemenu = (store: Store) => {
  if (!assertStore(store, log, 'showSidemenu failed')) {
    return
  }

  store.set('sidemenu')({ visible: true })
}

export const hideSidemenu = (store: Store) => {
  if (!assertStore(store, log, 'hideSidemenu failed')) {
    return
  }

  store.set('sidemenu')({ visible: false })
}

export const toggleSidemenu = (store: Store) => {
  if (!assertStore(store, log, 'toggleSidemenu failed')) {
    return
  }

  store.set('sidemenu')({ visible: !store.get('sidemenu').visible })
}
