import React, { useEffect, useState } from 'react'
import userStorage from '../../lib/gundb/UserStorage'
import logger from '../../lib/logger/pino-logger'
import SimpleStore from '../../lib/undux/SimpleStore'
import { getScreenHeight, getScreenWidth } from '../../lib/utils/Orientation'
import Config from '../../config/config'
const log = logger.child({ from: 'RewardsTab' })

const RewardsTab = props => {
  const [loginToken, setLoginToken] = useState()

  const store = SimpleStore.useStore()

  // const scrolling = isIOS ? 'no' : 'yes'

  const getToken = async () => {
    let token = (await userStorage.getProfileFieldValue('loginToken')) || ''
    log.debug('got rewards login token', token)
    setLoginToken(token)
  }
  const isLoaded = () => {
    store.set('loadingIndicator')({ loading: false })
  }

  const [height, setHeight] = useState(getScreenHeight() - 56)
  useEffect(() => {
    store.set('loadingIndicator')({ loading: true })
    getToken()

    const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent'
    const eventer = window[eventMethod]
    const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message'
    eventer(messageEvent, function(e) {
      const data = e.data
      if (data && data.type && data.type === 'iFrameHeight' && data.height) {
        setHeight(data.height)
      }
    })
  }, [])
  return loginToken === undefined ? null : (
    <iframe
      title="Rewards"
      src={`${Config.web3SiteUrl}?token=${loginToken}&purpose=iframe`}
      allowFullScreen
      frameBorder="0"
      seamless
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        minWidth: '100%',
        minHeight: '100%',
        width: getScreenWidth(),
        height: height,
      }}
      onLoad={isLoaded}
    />
  )
}

RewardsTab.navigationOptions = {
  title: 'Rewards',
}
export default RewardsTab

//
// import React, { useEffect, useState } from 'react'
// import userStorage from '../../lib/gundb/UserStorage'
// import logger from '../../lib/logger/pino-logger'
// import SimpleStore from '../../lib/undux/SimpleStore'
// import { getScreenHeight, getScreenWidth } from '../../lib/utils/Orientation'
// import Config from '../../config/config'
//
// const log = logger.child({ from: 'RewardsTab' })
//
// const RewardsTab = props => {
//   const [loginToken, setLoginToken] = useState()
//   const store = SimpleStore.useStore()
//
//   const getToken = async () => {
//     let token = (await userStorage.getProfileFieldValue('loginToken')) || ''
//     log.debug('got rewards login token', token)
//     setLoginToken(token)
//   }
//   const isLoaded = () => {
//     store.set('loadingIndicator')({ loading: false })
//   }
//   const [height, setHeight] = useState(getScreenHeight() - 56)
//   useEffect(() => {
//     store.set('loadingIndicator')({ loading: true })
//     getToken()
//
//     const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent'
//     const eventer = window[eventMethod]
//     const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message'
//     eventer(messageEvent, function(e) {
//       const data = e.data
//       if (data && data.type && data.type === 'iFrameHeight' && data.height) {
//         setHeight(data.height)
//       }
//     })
//   }, [])
//
//   return loginToken === undefined ? null : (
//     <iframe
//       title="Rewards"
//       src={`https://etoro.gooddollar.org?token=${loginToken}&purpose=iframe`}
//       allowFullScreen
//       frameBorder="0"
//       seamless
//       style={{
//         maxWidth: '100%',
//         maxHeight: '100%',
//         minWidth: '100%',
//         minHeight: '100%',
//         width: getScreenWidth(),
//         height: height,
//       }}
//       onLoad={isLoaded}
//     />
//   )
// }
//
// RewardsTab.navigationOptions = {
//   title: 'Rewards',
// }
// export default RewardsTab
