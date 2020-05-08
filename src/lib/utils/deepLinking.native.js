import branch from 'react-native-branch'
import { assign, camelCase, keys, mapKeys, over, pick } from 'lodash'
import logger from '../logger/pino-logger'
import { extractQueryParams } from '../share'
import restart from './restart'
import extractPathname from './extractPathname'

const log = logger.child({ from: 'linking.native' })

class DeepLinkingNative {
  constructor() {
    this.subscribe()
  }

  _unsubscribe = null

  _lastClick = null

  _isFirstRun = true

  params = {
    web3: '',
    paymentCode: '',
    code: '',
    reason: '',
    event: '',
  }

  navigationCallbacks = []

  pathname = ''

  subscribe = navigationCallback => {
    this._unsubscribe = branch.subscribe(this._listener)
    if (navigationCallback) {
      this.navigationCallbacks.push(navigationCallback)
    }
  }

  unsubscribe = () => {
    if (this._unsubscribe) {
      this._unsubscribe()
      this._unsubscribe = null
    }
  }

  _listener = ({ error, params }) => {
    if (error) {
      log.error('Error from Branch: ' + error)
      return
    }

    const { clickedBranchLink, clickTimestamp, nonBranchLink, referingLink } = mapKeys(params, (_, name) =>
      camelCase(name)
    )

    if (!this._isFirstRun && clickedBranchLink && this._lastClick !== clickTimestamp) {
      return restart()
    }

    this._isFirstRun = false
    this._lastClick = clickTimestamp
    const branchLink = referingLink
    const queryParams = nonBranchLink ? extractQueryParams(nonBranchLink) : params

    this.pathname = extractPathname(nonBranchLink || branchLink)

    assign(this.params, pick(queryParams, keys(this.params)))

    over(this.navigationCallbacks)()
  }
}

export default new DeepLinkingNative()
