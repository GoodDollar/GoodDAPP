import React, { useEffect, useState } from 'react'
import IframeResizer from 'iframe-resizer-react'
import { isIOS } from 'mobile-device-detect'
import userStorage from '../../lib/gundb/UserStorage'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import SimpleStore from '../../lib/undux/SimpleStore'
import API from '../../lib/API/api'
const log = logger.child({ from: 'MarketTab' })

const MarketTab = props => {
  const [loginToken, setLoginToken] = useState()
  const store = SimpleStore.useStore()
  const scrolling = isIOS ? 'no' : 'yes'

  const getToken = async () => {
    let token = await userStorage.getProfileFieldValue('marketToken')
    if (token == null) {
      token = await API.getMarketToken()
        .then(_ => _.jwt)
        .catch(_ => log.error(_))
    }

    log.debug('got market login token', token)
    setLoginToken(token)
  }
  const isLoaded = () => {
    store.set('loadingIndicator')({ loading: false })
  }

  useEffect(() => {
    store.set('loadingIndicator')({ loading: true })
    getToken()
  }, [])

  return loginToken === undefined ? null : (
    <IframeResizer
      title="GoodMarket"
      scrolling={scrolling}
      src={`${Config.marketUrl}`}
      allowFullScreen
      frameBorder="0"
      width="100%"
      height="100%"
      seamless
      style={{ flex: 1 }}
      onLoad={isLoaded}
    />
  )
}

MarketTab.navigationOptions = {
  title: 'GoodMarket',
}
export default MarketTab
