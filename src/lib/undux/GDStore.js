// @flow
import { createConnectedStore, type StoreDefinition, withReduxDevtools } from 'undux'
import { compose } from 'lodash/fp'
import type { StandardFeed } from '../userStorage/StandardFeed'
import { appEnv } from '../utils/env'

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
  isLoggedIn: false,
  destinationPath: '',
  feeds: [],
  currentFeed: undefined,
  feedLoading: false,
  inviteCode: undefined,
  invitesData: {
    level: {},
    totalEarned: 0,
  },
  uploadedAvatar: null,
}

/**
 * default exported instance of our global Undux Store
 * @module
 */
const GDStore: StoreDefinition<State> = createConnectedStore(
  initialState,
  compose(
    withPinoLogger,
    appEnv && withReduxDevtools,
  ),
)

export default GDStore
