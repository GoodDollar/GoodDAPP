// @flow
import type { Store } from 'undux'
import { assertStore } from '../SimpleStore'
import pino from '../../logger/js-logger'

const log = pino.child({ from: 'loadingIndicator' })

export const toggleLoadingIndicator = (store: Store, loading: boolean) => {
  if (!assertStore(store, log, `toggleLoadingIndicator(${String(loading)}) failed`)) {
    return
  }

  store.set('loadingIndicator')({ loading })
}

export const showLoadingIndicator = (store: Store) => toggleLoadingIndicator(store, true)

export const hideLoadingIndicator = (store: Store) => toggleLoadingIndicator(store, false)
