import React, { useEffect, useState } from 'react'
import IframeResizer from 'iframe-resizer-react'
import { isIOS } from 'mobile-device-detect'
import userStorage from '../../lib/gundb/UserStorage'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import SimpleStore from '../../lib/undux/SimpleStore'

const log = logger.child({ from: 'MarketTab' })

const MarketTab = props => {
  const [loginToken, setLoginToken] = useState()
  const store = SimpleStore.useStore()
  const scrolling = isIOS ? 'no' : 'yes'

  const getToken = async () => {
    let token = (await userStorage.getProfileFieldValue('marketToken')) || ''
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
      src={`${Config.marketUrl}?jwt=${loginToken}`}
      allowFullScreen
      frameBorder="0"
      width="100%"
      height="100%"
      seamless
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        minWidth: '100%',
        minHeight: '100%',
        width: 0,
      }}
      onLoad={isLoaded}
    />
  )
}

MarketTab.navigationOptions = {
  title: 'GoodMarket',
}
export default MarketTab
