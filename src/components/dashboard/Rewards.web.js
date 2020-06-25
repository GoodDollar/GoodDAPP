import React, { useEffect, useMemo, useState } from 'react'

// import { isIOS } from 'mobile-device-detect'
import { get, toPairs } from 'lodash'
import userStorage from '../../lib/gundb/UserStorage'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'

const log = logger.child({ from: 'RewardsTab' })

const openInNewTab = false //isIOS
const RewardsTab = props => {
  const [token, setToken] = useState()
  const store = SimpleStore.useStore()
  const [showDialog] = useDialog()

  const getRewardsPath = () => {
    const params = get(props, 'navigation.state.params', {})
    if (openInNewTab === false) {
      params.purpose = 'iframe'
    }
    params.token = token
    let path = decodeURIComponent(get(params, 'rewardsPath', ''))
    const query = toPairs(params)
      .filter(p => p[0] !== 'rewardsPath')
      .map(param => param.join('='))
      .join('&')

    return `${Config.web3SiteUrl}/${path}?${query}`
  }

  const getToken = async () => {
    let token = (await userStorage.getProfileFieldValue('loginToken')) || ''
    log.debug('got rewards login token', token)
    setToken(token)
  }
  const isLoaded = () => {
    store.set('loadingIndicator')({ loading: false })
  }

  useEffect(() => {
    store.set('loadingIndicator')({ loading: true })
    getToken()
    return () => store.set('loadingIndicator')({ loading: false })
  }, [])

  useEffect(() => {
    if (openInNewTab && token) {
      store.set('loadingIndicator')({ loading: false })
      showDialog({
        title: 'Press ok to go to Rewards dashboard',
        buttons: [
          {
            text: 'OK',
            onPress: () => {
              window.open(getRewardsPath(), '_blank')
            },
          },
        ],
        onDismiss: () => {
          props.navigation.navigate('Home')
        },
      })
    }
  }, [token])

  const src = getRewardsPath()
  const iframe = useMemo(() => {
    return <iframe title="Rewards" onLoad={isLoaded} src={src} seamless frameBorder="0" style={{ flex: 1 }} />
  }, [src])

  if (openInNewTab || token === undefined) {
    return null
  }

  return iframe
}

RewardsTab.navigationOptions = {
  title: 'Invite',
}

export default RewardsTab
