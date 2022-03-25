// @flow
import { createConnectedStore, type StoreDefinition } from 'undux'
import { compose } from 'lodash/fp'
import type { StandardFeed } from '../userStorage/StandardFeed'
import withPinoLogger from './plugins/logger'
import { createUseCurriedSettersHook, createUseStorePropHook } from './utils/props'

/**
 * Account data
 * @type {{balance: ?string}, {entitlement: ?string}, {ready: false}}
 */
export type Account = {
  balance: ?string,
  entitlement: ?string,
  ready: false,
}

export type VerificationState = {
  attemptsCount: number,
  attemptsHistory: string[],
  reachedMaxAttempts: boolean,
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
  destinationPath: '',
  feeds: [],
  currentFeed: undefined,
  feedLoading: false,
}

/**
 * default exported instance of our global Undux Store
 * @module
 */
const GDStore: StoreDefinition<State> = createConnectedStore(initialState, compose(withPinoLogger))

export const useCurriedSetters = createUseCurriedSettersHook(() => GDStore)

export const useStoreProp = createUseStorePropHook(() => GDStore)

export default GDStore
