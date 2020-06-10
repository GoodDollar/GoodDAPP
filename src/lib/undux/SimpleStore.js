// @flow
import { createConnectedStore } from 'undux'
import { AsyncStorage } from 'react-native'
import { flow as compose, isString } from 'lodash'

import { IS_LOGGED_IN } from '../constants/localStorage'
import pinoLogger from '../logger/pino-logger'
import withPinoLogger, { log as unduxLogger } from './plugins/logger'
import { createUseCurriedSettersHook } from './utils/setter'

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
 * Loading indicator screen status. In true means that there is a loading overlay over the current screen
 * @type {{loading: boolean}}
 */
type LoadingIndicator = {
  loading: boolean,
}

/**
 * Type definition for the global store
 * @type {
   {currentScreen: CurrentScreen},
   {destinationPath: string},
   {loadingIndicator: LoadingIndicator},
   {isLoggedInCitizen: boolean},
   {isLoggedIn: boolean},
   {sidemenu: { visible: boolean }}
  }
 */
export type State = {
  currentScreen: CurrentScreen,
  destinationPath: string,
  loadingIndicator: LoadingIndicator,
  isLoggedInCitizen: boolean,
  isLoggedIn: boolean,
  feedLoadAnimShown: boolean,
  wallet: any,
  userStorage: any,
  sidemenu: {
    visible: boolean,
  },
  isMobileSafariKeyboardShown: boolean,
  isMobileKeyboardShown: boolean,
  currentFeed: any,
  addWebApp: {
    show: boolean,
    showAddWebAppDialog: boolean,
  },
  serviceWorkerUpdated: any,
}

/**
 * Initial store state
 * @constant
 */
const initialState: State = {
  installPrompt: null,
  isLoggedInCitizen: false,
  isLoggedIn: false,
  feedLoadAnimShown: false,
  currentScreen: {
    dialogData: {
      visible: false,
    },
    loading: false,
  },
  destinationPath: '',
  loadingIndicator: {
    loading: false,
  },
  sidemenu: {
    visible: false,
  },
  isMobileSafariKeyboardShown: false,
  isMobileKeyboardShown: false,
  currentFeed: null,
  addWebApp: {
    show: false,
    showAddWebAppDialog: false,
  },
  wallet: null,
  userStorage: null,
  serviceWorkerUpdated: null,
}

// keeping current snapshot in private module variable
// it could be accessed via getCurrentSnapshot
// we need it to habe show dialog outside components/hooks
// sometimes it's needed for example in the web-only Zoom sdk wrapper
// we have to show 'reload app' dialog on 65391 exception
let currentSnapshot = null

const storeEffects = compose([
  withPinoLogger,
  storeDefinition => {
    // effect which updates currentSnapshot
    storeDefinition.onAll().subscribe(() => {
      currentSnapshot = storeDefinition.getCurrentSnapshot()
    })

    return storeDefinition
  },
])

/**
 * default exported instance of our global Undux Store
 * @module
 */
let SimpleStore: UnduxStore = createConnectedStore(initialState, storeEffects) // default value for tests

const initStore = async () => {
  let isLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN).then(JSON.parse)
  const newState = { ...initialState, isLoggedIn }
  SimpleStore = createConnectedStore(newState, storeEffects)
  return SimpleStore
}

// functions which set userStorage and wallet to simple storage in init.js
let setWallet, setUserStorage
const setInitFunctions = (_setWallet, _setUserStorage) => {
  setWallet = _setWallet
  setUserStorage = _setUserStorage
}

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

const useCurriedSetters = createUseCurriedSettersHook(() => SimpleStore)

const assertStore = (store, logger = unduxLogger, message = 'Operation failed') =>
  storeAssertion(() => !store, logger, message)

const assertStoreSnapshot = (store, logger = unduxLogger, message = 'Operation failed') =>
  storeAssertion(() => !store || !store.storeSnapshot, logger, message)

const getCurrentSnapshot = () => currentSnapshot

export {
  initStore,
  assertStore,
  assertStoreSnapshot,
  SimpleStore as default,
  getCurrentSnapshot,
  setInitFunctions,
  setWallet,
  setUserStorage,
  useCurriedSetters,
}
