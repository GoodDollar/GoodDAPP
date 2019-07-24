// @flow
import { createConnectedStore, type StoreDefinition } from 'undux'
import compose from 'lodash/fp/compose'
import effects from '../../lib/undux/effects'
import type { StandardFeed } from '../gundb/UserStorageClass'
import withPinoLogger from './plugins/logger'

/**
 * Wheather the balance update is running or not
 * @type
 */
type BalanceUpdate = {
  running: boolean,
}

/**
 * Account data
 * @type
 */
type Account = {
  balance: ?string,
  entitlement: ?string,
  ready: false,
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
  feedLoading: Boolean,
}

/**
 * Initial store state
 * @constant
 */
const initialState: State = {
  balanceUpdate: {
    running: false,
  },
  account: {
    balance: undefined,
    entitlement: undefined,
    ready: false,
  },
  isLoggedInCitizen: false,
  isLoggedIn: false,
  profile: {},
  privateProfile: {},
  destinationPath: '',
  feeds: [],
  feedLoading: false,
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
