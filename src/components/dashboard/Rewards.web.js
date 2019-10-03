import React, { useEffect, useState } from 'react'
import get from 'lodash/get'
import { isIOS } from 'mobile-device-detect'
import userStorage from '../../lib/gundb/UserStorage'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import SimpleStore from '../../lib/undux/SimpleStore'

const log = logger.child({ from: 'RewardsTab' })

const RewardsTab = props => {
  const [loginToken, setLoginToken] = useState()
  const [height, setHeight] = useState('100%')
  const store = SimpleStore.useStore()
  const scrolling = isIOS ? 'no' : 'yes'

  const getToken = async () => {
    let token = (await userStorage.getProfileFieldValue('loginToken')) || ''
    log.debug('got rewards login token', token)
    setLoginToken(token)
  }
  const isLoaded = function() {
    store.set('loadingIndicator')({ loading: false })
    const self = this
    let oldHeight = 0
    function resizeiframe() {
      let newHeight = get(self.document.getElementsByTagName('body'), '[0].offsetHeight')
      if (newHeight && newHeight !== oldHeight) {
        oldHeight = newHeight
        setHeight(newHeight)
      }
    }
    resizeiframe()
    self.contentWindow.onresize = resizeiframe
  }

  useEffect(() => {
    store.set('loadingIndicator')({ loading: true })
    getToken()
  }, [])

  return loginToken === undefined ? null : (
    <iframe
      title="Rewards"
      src={`${Config.web3SiteUrl}?token=${loginToken}&purpose=iframe`}
      scrolling={scrolling}
      allowFullScreen={true}
      frameBorder="0"
      width="100%"
      height="100%"
      seamless={true}
      onLoad={isLoaded}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        minWidth: '100%',
        minHeight: '100%',
        height,
        width: 0,
      }}
    />
  )
}

RewardsTab.navigationOptions = {
  title: 'Rewards',
}
export default RewardsTab
