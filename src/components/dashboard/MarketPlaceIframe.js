import React, { useEffect } from 'react'
import IframeResizer from 'iframe-resizer-react'
import { isIOS } from 'mobile-device-detect'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import SimpleStore from '../../lib/undux/SimpleStore'

const log = logger.child({ from: 'RewardsTab' })

const RewardsTab = props => {
  const store = SimpleStore.useStore()
  const scrolling = isIOS ? 'no' : 'yes'

  const isLoaded = () => {
    store.set('loadingIndicator')({ loading: false })
  }

  useEffect(() => {
    store.set('loadingIndicator')({ loading: true })
  }, [])

  log.info('Show marketplace')

  return (
    <IframeResizer
      title="Marketplace"
      scrolling={scrolling}
      src={`${Config.marketplaceUrl}?purpose=iframe`}
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

RewardsTab.navigationOptions = {
  title: 'Marketplace',
}

export default RewardsTab
