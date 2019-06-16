// @flow
import { createConnectedStore } from 'undux'
import { AsyncStorage } from 'react-native'
import updateLoggedIn from './effects/loggedin'
type DialogData = {
  visible: boolean,
  title?: string,
  message?: string
}

type CurrentScreen = {
  dialogData?: DialogData,
  loading: boolean
}

type LoadingIndicator = {
  loading: boolean
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
    visible: boolean
  }
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
      visible: false
    },
    loading: false
  },
  destinationPath: '',
  loadingIndicator: {
    loading: false
  },
  sidemenu: {
    visible: false
  }
}

/**
 * default exported instance of our global Undux Store
 * @module
 */
let SimpleStore: UnduxStore
const initStore = async () => {
  let isLoggedIn = await AsyncStorage.getItem('GOODDAPP_isLoggedIn')
  initialState.isLoggedIn = isLoggedIn
  SimpleStore = createConnectedStore(initialState, updateLoggedIn)
  return SimpleStore
}
export { initStore, SimpleStore as default }
