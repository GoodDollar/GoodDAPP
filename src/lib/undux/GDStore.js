// @flow
import { createConnectedStore, type StoreDefinition } from 'undux'
import { compose } from 'lodash/fp'
import type { StandardFeed } from '../gundb/UserStorageClass'
import effects from './effects'
import withPinoLogger from './plugins/logger'

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
  balanceUpdate: boolean,
  account: Account,
  destinationPath: string,
  feeds: StandardFeed[],
  feedLoading: boolean,
  currentFeed: any,
}

/**
 * Initial store state
 * @constant
 */
const initialState: State = {
  balanceUpdate: false,
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
