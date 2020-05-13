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
    if (navigationCallback) {
      this.navigationCallbacks.push(navigationCallback)
      
      // starting subscription only when first valid callback is passed
      // and we haven't active subscription yet
      // if pass this check - we'll have more that one callback invoke per each emit
      // and will be unable to unsubscribe if will subscribe more that once
      if (!this._unsubscribe) {
        // storing unsubscribe fn inside instance var
        this._unsubscribe = branch.subscribe(this._listener)
      }
    }
  }

  unsubscribe = () => {
    // if we have active subscription 
    if (this._unsubscribe) {
      // then calling unsubscribe fn
      this._unsubscribe()
      // cleaning up unsubscribe fn link
      this._unsubscribe = null
      // and cleaning callback previously added
      // if we don't perform this, they will be called
      // once we'll .subscribe() again
      this.navigationCallbacks.length = 0
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
