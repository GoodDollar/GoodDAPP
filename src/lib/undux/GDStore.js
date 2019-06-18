// @flow
import { createConnectedStore, type StoreDefinition, withReduxDevtools } from 'undux'
import compose from 'lodash/fp/compose'
import effects from '../../lib/undux/effects'
import withPinoLogger from './plugins/logger'

/**
 * Wheather the balance update is running or not
 * @type
 */
type BalanceUpdate = {
  running: boolean
}

/**
 * Account data
 * @type
 */
type Account = {
  balance: ?string,
  entitlement: ?string,
  ready: false
}

/**
 * Dialog data. This is being used to show a dialog across the app
 * @type
 */
type DialogData = {
  visible: boolean,
  title?: string,
  message?: string
}

/**
 * Dialog data. This is being used to show a dialog across the app
 * @type
 */
type SnackbarData = {
  visible: boolean,
  text?: string
}

/**
 * Current screen state data
 * @type
 */
type CurrentScreen = {
  dialogData?: DialogData,
  loading: boolean
}

/**
 * StandardFeed element. It's being used to show the feed on dashboard
 * @type
 */
export type StandardFeed = {
  id: string,
  date: number,
  type: string, // 'message' | 'withdraw' | 'send',
  data: {
    endpoint: {
      address: string,
      fullName: string,
      avatar: string
    },
    amount: string,
    message: string
  }
}

/**
 * Loading indicator screen status. In true means that there is a loading overlay over the current screen
 * @type
 */
type LoadingIndicator = {
  loading: boolean
}

/**
 * Type definition for the global store
 * @type
 */
export type State = {
  balanceUpdate: BalanceUpdate,
  account: Account,
  currentScreen: CurrentScreen,
  destinationPath: string,
  feeds: StandardFeed[],
  feedLoading: Boolean,
  loadingIndicator: LoadingIndicator,
  snackbarData: SnackbarData
}

/**
 * Initial store state
 * @constant
 */
const initialState: State = {
  balanceUpdate: {
    running: false
  },
  account: {
    balance: undefined,
    entitlement: undefined,
    ready: false
  },
  isLoggedInCitizen: false,
  isLoggedIn: false,
  currentScreen: {
    dialogData: {
      visible: false
    },
    loading: false
  },
  profile: {},
  destinationPath: '',
  feeds: [],
  loadingIndicator: {
    loading: false
  },
  feedLoading: false,
  sidemenu: {
    visible: false
  },
  snackbarData: {
    visible: false
  }
}

/**
 * default exported instance of our global Undux Store
 * @module
 */
const GDStore: StoreDefinition<State> = createConnectedStore(
  initialState,
  compose(
    effects,
    withPinoLogger,
    withReduxDevtools
  )
)

export default GDStore
