// @flow
import { createConnectedStore } from 'undux'
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
const SimpleStore: UnduxStore = createConnectedStore(initialState)

export default SimpleStore
