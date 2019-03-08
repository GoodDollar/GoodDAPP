// @flow
import { createConnectedStore, withReduxDevtools, withLogger } from 'undux'
import compose from 'lodash/fp/compose'

import withPinoLogger from './plugins/logger'

type Name = {
  fullName: string,
  valid?: boolean
}

type Account = {
  balance: string,
  entitlement: string
}

export type State = {
  name: Name,
  account: Account
}

const initialState: State = {
  name: {
    fullName: '',
    valid: undefined
  },
  account: {
    balance: '',
    entitlement: ''
  }
}

export default createConnectedStore(
  initialState,
  compose(
    withPinoLogger,
    withReduxDevtools
  )
)
