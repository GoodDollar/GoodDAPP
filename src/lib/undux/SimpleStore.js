// @flow
import { createConnectedStore } from 'undux'
import { AsyncStorage } from 'react-native'

/**
 * Dialog data. This is being used to show a dialog across the app
 * @type
 */
type DialogData = {
  visible: boolean,
  title?: string,
  message?: string,
}

/**
 * Current screen state data
 * @type
 */
type CurrentScreen = {
  dialogData?: DialogData,
  loading: boolean,
}

/**
 * Loading indicator screen status. In true means that there is a loading overlay over the current screen
 * @type
 */
type LoadingIndicator = {
  loading: boolean,
}

/**
 * Type definition for the global store
 * @type
 */
export type State = {
  currentScreen: CurrentScreen,
  destinationPath: string,
  loadingIndicator: LoadingIndicator,
  isLoggedInCitizen: boolean,
  isLoggedIn: boolean,
  sidemenu: {
    visible: boolean,
  },
}

/**
 * Initial store state
 * @constant
 */
const initialState: State = {
  isLoggedInCitizen: false,
  isLoggedIn: false,
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
}

/**
 * default exported instance of our global Undux Store
 * @module
 */
let SimpleStore: UnduxStore = createConnectedStore(initialState) // default value for tests
const initStore = async () => {
  let isLoggedIn = await AsyncStorage.getItem('GOODDAPP_isLoggedIn').then(JSON.parse)
  initialState.isLoggedIn = isLoggedIn
  SimpleStore = createConnectedStore(initialState)
  return SimpleStore
}
export { initStore, SimpleStore as default }
