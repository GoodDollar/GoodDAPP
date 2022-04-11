// @flow
import { createConnectedStore } from 'undux'
import { isString } from 'lodash'

import pinoLogger from '../logger/js-logger'

/**
 * Dialog data. This is being used to show a dialog across the app
 * @type {{visible: boolean}, {title?: string}, {message?: string}}
 */
type DialogData = {
  visible: boolean,
  title?: string,
  message?: string,
}

/**
 * Current screen state data
 * @type {{dialogData?: DialogData}, {loading: boolean}}
 */
type CurrentScreen = {
  dialogData?: DialogData,
  loading: boolean,
}

/**
 * Type definition for the global store
 * @type {
   {currentScreen: CurrentScreen},
   {destinationPath: string},
   {loadingIndicator: LoadingIndicator},
   {isLoggedIn: boolean},
   {sidemenu: { visible: boolean }}
  }
 */
export type State = {
  currentScreen: CurrentScreen,
  destinationPath: string,
  isLoggedIn: boolean,
  feedLoadAnimShown: boolean,
  wallet: any,
  userStorage: any,
  sidemenu: {
    visible: boolean,
  },
  currentFeed: any,
  serviceWorkerUpdated: any,
}

/**
 * Initial store state
 * @constant
 */
const initialState: State = {
  isLoggedIn: false,
  feedLoadAnimShown: false,
  currentScreen: {
    dialogData: {
      visible: false,
    },
    loading: false,
  },
  destinationPath: '',
  sidemenu: {
    visible: false,
  },
  currentFeed: null,
  wallet: null,
  userStorage: null,
  regMethod: 'torus',
}

/**
 * default exported instance of our global Undux Store
 * @module
 */
let SimpleStore: UnduxStore = createConnectedStore(initialState) // default value for tests

// functions which set userStorage and wallet to simple storage in init.js

const storeAssertion = (condition, logger, message) => {
  let log = logger
  const assertionFailed = condition()

  if (isString(logger)) {
    log = pinoLogger.child({ from: logger })
  }

  if (assertionFailed) {
    log.warn(message, 'Received store is null')
  }

  return !assertionFailed
}

const assertStore = (store, logger, message = 'Operation failed') => storeAssertion(() => !store, logger, message)

const assertStoreSnapshot = (store, logger, message = 'Operation failed') =>
  storeAssertion(() => !store || !store.storeSnapshot, logger, message)

const initStore = () => {
  const newState = { ...initialState }
  SimpleStore = createConnectedStore(newState)
  return SimpleStore
}

export { initStore, assertStore, assertStoreSnapshot, SimpleStore as default }
