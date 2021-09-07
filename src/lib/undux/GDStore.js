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
type Account = {
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
  account: Account,
  destinationPath: string,
  feeds: StandardFeed[],
  feedLoading: boolean,
  currentFeed: any,
  verification: VerificationState,
}

export const defaultVerificationState: VerificationState = {
  attemptsCount: 0,
  attemptsHistory: [],
  reachedMaxAttempts: false,
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
  verification: {
    ...defaultVerificationState,
  },
  isLoggedInCitizen: false,
  isLoggedIn: false,
  destinationPath: '',
  feeds: [],
  currentFeed: undefined,
  feedLoading: false,
  inviteCode: undefined,
  inviteLevel: undefined,
  uploadedAvatar: null,
}

/**
 * default exported instance of our global Undux Store
 * @module
 */
const GDStore: StoreDefinition<State> = createConnectedStore(initialState, compose(withPinoLogger))

export const useCurriedSetters = createUseCurriedSettersHook(() => GDStore)

export const useStoreProp = createUseStorePropHook(() => GDStore)

export default GDStore
