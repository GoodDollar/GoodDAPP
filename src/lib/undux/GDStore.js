// @flow
import { createConnectedStore, withReduxDevtools } from 'undux'
import compose from 'lodash/fp/compose'

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
  balance: string,
  entitlement: string,
  ready: false
}

export type State = {
  balanceUpdate: BalanceUpdate,
  name: Name,
  account: Account
}

const initialState: State = {
  balanceUpdate: {
    running: false
  },
  name: {
    fullName: '',
    valid: undefined
  },
  account: {
    balance: '',
    entitlement: '',
    ready: false
  },
  isLoggedInCitizen: false
}

export default createConnectedStore(
  initialState,
  compose(
    effects,
    withPinoLogger,
    withReduxDevtools
  )
)
