import branch from 'react-native-branch'
import { extractQueryParams } from '../share'
import restart from './restart'
import extractPathname from './extractPathname'

class LinkingNative {
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
    }
    this._unsubscribe = branch.subscribe(this._listener)
  }

  unsubscribe = () => {
    if (this._unsubscribe) {
      this._unsubscribe()
      this._unsubscribe = null
    }
  }

  _listener = ({ error, params }) => {
    if (error) {
      console.error('Error from Branch: ' + error)
      return
    }

    if (!this._isFirstRun && params['+clicked_branch_link'] && this._lastClick !== params['+click_timestamp']) {
      return restart()
    }

    this._isFirstRun = false
    this._lastClick = params['+click_timestamp']
    const nonBranchLink = params['+non_branch_link']
    const branchLink = params['~referring_link']
    const queryParams = nonBranchLink ? extractQueryParams(nonBranchLink) : params
    const validParams = Object.keys(this.params)

    this.pathname = extractPathname(nonBranchLink || branchLink)

    validParams.forEach(validParam => {
      if (queryParams[validParam]) {
        this.params[validParam] = queryParams[validParam]
      }
    })

    this.navigationCallbacks.forEach(navigation => {
      if (navigation) {
        return navigation()
      }
    })
  }
}

export default new LinkingNative()
