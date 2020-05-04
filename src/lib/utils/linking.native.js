import branch from 'react-native-branch'
import { assign, camelCase, keys, mapKeys, over, pick } from 'lodash'
import logger from '../logger/pino-logger'
import { extractQueryParams } from '../share'
import restart from './restart'
import extractPathname from './extractPathname'

const log = logger.child({ from: 'linking.native' })

class LinkingNative {
  constructor() {
    this.subscribe()
  }

  _unsubscribe = null

  _lastClick = null

  _isFirstRun = true

  linkingParams = {
    web3: '',
    paymentCode: '',
    code: '',
    reason: '',
    event: '',
  }

  navigationCallbacks = []

  pathname = ''

  subscribe = navigationCallback => {
    if (navigationCallback) {
      this.navigationCallbacks.push(navigationCallback)
    }
    if (!this._unsubscribe) {
      this._unsubscribe = branch.subscribe(this._listener)
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

    assign(this.linkingParams, pick(queryParams, keys(this.linkingParams)))

    over(this.navigationCallbacks)()
  }
}

export default new LinkingNative()
