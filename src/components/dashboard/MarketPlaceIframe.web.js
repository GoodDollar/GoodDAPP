import React, { useEffect } from 'react'

// import { View } from 'react-native'
import IframeResizer from 'iframe-resizer-react'
import { isIOS } from 'mobile-device-detect'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import SimpleStore from '../../lib/undux/SimpleStore'

const log = logger.child({ from: 'RewardsTab' })

const MarketTab = props => {
  const store = SimpleStore.useStore()
  const scrolling = isIOS ? 'no' : 'yes'

  const isLoaded = () => {
    store.set('loadingIndicator')({ loading: false })
  }

  useEffect(() => {
    store.set('loadingIndicator')({ loading: true })
  }, [])

  log.info('Show marketplace', Config.marketplaceUrl)

  return (
    <IframeResizer
      title="GoodMarket"
      scrolling={scrolling}
      src={`${Config.marketplaceUrl}`}
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
  title: 'Marketplace',
}

export default MarketTab
