// @flow
import { createConnectedStore, withReduxDevtools } from 'undux'
import compose from 'lodash/fp/compose'
import { BN } from 'web3-utils'

import withPinoLogger from './plugins/logger'
import effects from '../../lib/undux/effects'

type BalanceUpdate = {
  running: boolean
}

type Name = {
  fullName: string,
  valid?: boolean
}

type Account = {
  balance: ?string,
  entitlement: ?string,
  ready: false
}

type DialogData = {
  visible: boolean,
  title?: string,
  message?: string
}

type CurrentScreen = {
  dialogData?: DialogData,
  loading: boolean
}

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

type LoadingIndicator = {
  loading: boolean
}

/**
 * Type definition for the global store
 * @type
 */
export type State = {
  balanceUpdate: BalanceUpdate,
  name: Name,
  account: Account,
  currentScreen: CurrentScreen,
  destinationPath: string,
  feeds: StandardFeed[],
  feedLoading: Boolean,
  loadingIndicator: LoadingIndicator
}

/**
 * Initial store state
 * @constant
 */
const initialState: State = {
  balanceUpdate: {
    running: false
  },
  name: {
    fullName: '',
    valid: undefined
  },
  account: {
    balance: new BN(0),
    entitlement: new BN(0),
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
  }
}

/**
 * default exported instance of our global Undux Store
 * @module
 */
const GDStore: UnduxStore = createConnectedStore(
  initialState,
  compose(
    effects,
    withPinoLogger,
    withReduxDevtools
  )
)

export default GDStore
