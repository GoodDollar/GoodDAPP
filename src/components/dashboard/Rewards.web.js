import React, { useEffect, useState } from 'react'
import IframeResizer from 'iframe-resizer-react'
import { isIOS } from 'mobile-device-detect'
import userStorage from '../../lib/gundb/UserStorage'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import SimpleStore from '../../lib/undux/SimpleStore'

const log = logger.child({ from: 'RewardsTab' })

const RewardsTab = props => {
  const [loginToken, setLoginToken] = useState()
  const store = SimpleStore.useStore()
  const scrolling = isIOS ? 'no' : 'yes'

  const getToken = async () => {
    let token = (await userStorage.getProfileFieldValue('loginToken')) || ''
    log.debug('got rewards login token', token)
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
      title="Rewards"
      scrolling={scrolling}
      src={`${Config.web3SiteUrl}?jwt=${loginToken}&purpose=iframe`}
      allowFullScreen
      checkOrigin={false}
      frameBorder="0"
      width="100%"
      height="100%"
      seamless
      style={{ flex: 1 }}
      onLoad={isLoaded}
    />
  )
}

RewardsTab.navigationOptions = {
  title: 'Rewards',
}
export default RewardsTab
