// @flow
import { createConnectedStore, type StoreDefinition } from 'undux'
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
      avatar?: string
    },
    amount: string,
    message: string
  }
}

/**
 * Type definition for the global store
 * @type
 */
export type State = {
  balanceUpdate: BalanceUpdate,
  account: Account,
  destinationPath: string,
  feeds: StandardFeed[],
  feedLoading: Boolean
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
  profile: {},
  destinationPath: '',
  feeds: [],
  feedLoading: false
}

/**
 * default exported instance of our global Undux Store
 * @module
 */
const GDStore: StoreDefinition<State> = createConnectedStore(
  initialState,
  compose(
    effects,
    withPinoLogger
  )
)

export default GDStore
