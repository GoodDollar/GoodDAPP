// @flow
import { createConnectedStore } from 'undux'
import { AsyncStorage } from 'react-native'
import { IS_LOGGED_IN } from '../constants/localStorage'
import withPinoLogger from './plugins/logger'

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

/**
 * default exported instance of our global Undux Store
 * @module
 */
let SimpleStore: UnduxStore = createConnectedStore(initialState, withPinoLogger) // default value for tests
const initStore = async () => {
  let isLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN).then(JSON.parse)
  initialState.isLoggedIn = isLoggedIn
  SimpleStore = createConnectedStore(initialState, withPinoLogger)
  return SimpleStore
}

// functions which set userStorage and wallet to simple storage in init.js
let setWallet, setUserStorage
const setInitFunctions = (_setWallet, _setUserStorage) => {
  setWallet = _setWallet
  setUserStorage = _setUserStorage
}

export { initStore, SimpleStore as default, setInitFunctions, setWallet, setUserStorage }
