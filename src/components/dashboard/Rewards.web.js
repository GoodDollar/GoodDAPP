import React, { useEffect, useState } from 'react'
import userStorage from '../../lib/gundb/UserStorage'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
const log = logger.child({ from: 'RewardsTab' })

const RewardsTab = props => {
  const [loginToken, setLoginToken] = useState()
  const getToken = async () => {
    let token = await userStorage.getProfileFieldValue('loginToken')
    log.debug('got rewards login token', token)
    setLoginToken(token)
  }
  useEffect(() => {
    getToken()
  }, [])

  return loginToken ? (
    <div
      style={{
        height: '100%',
        overflow: 'scroll !important',
        WebkitOverflowScrolling: 'touch !important',
      }}
    >
      <iframe
        title="Rewards"
        src={`${Config.web3SiteUrl}?token=${loginToken}`}
        scrolling="no"
        allowFullScreen={true}
        frameBorder="0"
        seamless={true}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          minWidth: '100%',
          minHeight: '100%',
          width: 0,
        }}
      />
    </div>
  ) : null
}

RewardsTab.navigationOptions = {
  title: 'Rewards',
}
export default RewardsTab
