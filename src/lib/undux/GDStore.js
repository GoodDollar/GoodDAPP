// @flow
import { createConnectedStore, withReduxDevtools } from 'undux'

import withPinoLogger from './plugins/logger'

type Name = {
  fullName: string,
  valid?: boolean
}

export type State = {
  name: Name
}

const initialState: State = {
  name: {
    fullName: '',
    valid: undefined
  }
}

export default createConnectedStore(initialState, withPinoLogger, withReduxDevtools)
