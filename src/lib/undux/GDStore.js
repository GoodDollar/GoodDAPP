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

type DialogData = {
  visible: boolean,
  title?: string,
  message?: string
}

type CurrentScreen = {
  dialogData?: DialogData,
  loading: boolean
}

export type State = {
  balanceUpdate: BalanceUpdate,
  name: Name,
  account: Account,
  currentScreen: CurrentScreen,
  destinationPath: string
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
  isLoggedInCitizen: false,
  currentScreen: {
    dialogData: {
      visible: false
    },
    loading: false
  },
  profile: {},
  destinationPath: ''
}

export default createConnectedStore(
  initialState,
  compose(
    effects,
    withPinoLogger,
    withReduxDevtools
  )
)
