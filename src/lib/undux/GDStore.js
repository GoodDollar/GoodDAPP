// @flow
import { createConnectedStore, type StoreDefinition } from 'undux'
import compose from 'lodash/fp/compose'
import effects from '../../lib/undux/effects'
import type { StandardFeed } from '../gundb/UserStorageClass'
import withPinoLogger from './plugins/logger'

/**
 * Wheather the balance update is running or not
 * @type {{running: boolean}}
 */
type BalanceUpdate = {
  running: boolean,
}

/**
 * Account data
 * @type {{balance: ?string}, {entitlement: ?string}, {ready: false}}
 */
type Account = {
  balance: ?string,
  entitlement: ?string,
  ready: false,
}

/**
 * Type definition for the global store
 * @type {
    {balanceUpdate: BalanceUpdate},
    {account: Account},
    {destinationPath: string},
    {feeds: StandardFeed[]},
    {feedLoading: Boolean}
  }
 */
export type State = {
  balanceUpdate: BalanceUpdate,
  account: Account,
  destinationPath: string,
  feeds: StandardFeed[],
  feedLoading: Boolean,
  currentFeed: any,
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
  currentFeed: undefined,
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
