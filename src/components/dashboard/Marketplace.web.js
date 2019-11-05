import React, { useEffect, useState } from 'react'
import IframeResizer from 'iframe-resizer-react'
import { isIOS, osVersion } from 'mobile-device-detect'
import _get from 'lodash/get'
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
    try {
      let token = await userStorage.getProfileFieldValue('marketToken')
      if (token) {
        setLoginToken(token)
      }

      const newtoken = await API.getMarketToken().then(_ => _get(_, 'data.jwt'))
      if (newtoken !== undefined && newtoken !== token) {
        token = newtoken
        userStorage.setProfileField('marketToken', newtoken)
        setLoginToken(newtoken)
      }
      log.debug('got market login token', token)
      if (token == null) {
        //continue to market without login in
        setLoginToken('')
        throw new Error('empty market token')
      }
    } catch (e) {
      log.error(e, e.message)

      // showErrorDialog('Error login in to market, try again later or contact support', 'MARKETPLACE-1')
    }
  }
  const isLoaded = () => {
    store.set('loadingIndicator')({ loading: false })
  }

  useEffect(() => {
    store.set('loadingIndicator')({ loading: true })
    getToken()
  }, [])

  if (loginToken === undefined) {
    return null
  }
  const src = `${Config.marketUrl}?jwt=${loginToken}&nofooter=true`
  if (isIOS === false || osVersion > 13) {
    return (
      <iframe
        title="GoodMarket"
        scrolling="yes"
        onLoad={isLoaded}
        src={src}
        seamless
        frameBorder="0"
        style={{ flex: 1 }}
      />
    )
  }
  return (
    <IframeResizer
      title="GoodMarket"
      scrolling={scrolling}
      src={src}
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

MarketTab.navigationOptions = {
  title: 'GoodMarket',
}
export default MarketTab
