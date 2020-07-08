// @flow
import { createConnectedStore, type StoreDefinition } from 'undux'
import { compose } from 'lodash/fp'
import effects from '../../lib/undux/effects'
import type { StandardFeed } from '../gundb/StandardFeed'
import withPinoLogger from './plugins/logger'
import { createUseCurriedSettersHook } from './utils/setter'

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
  verificationAttempts: number,
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
  verificationAttempts: 0,
  isLoggedInCitizen: false,
  isLoggedIn: false,
  profile: {},
  privateProfile: {},
  destinationPath: '',
  feeds: [],
  currentFeed: undefined,
  feedLoading: false,
  inviteCode: undefined,
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
  ),
)

export const useCurriedSetters = createUseCurriedSettersHook(() => GDStore)

export default GDStore
