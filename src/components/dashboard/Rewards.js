import React, { useCallback, useEffect, useMemo, useState } from 'react'

// import { isIOSWeb } from '../../lib/utils/platform'
import { get, toPairs } from 'lodash'
import userStorage from '../../lib/gundb/UserStorage'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import SimpleStore from '../../lib/undux/SimpleStore'
import { useDialog } from '../../lib/undux/utils/dialog'
import { createIframe } from '../webView/iframe'
import useOnPress from '../../lib/hooks/useOnPress'

const log = logger.child({ from: 'RewardsTab' })

const openInNewTab = false //isIOSWeb
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

  const getToken = useCallback(async () => {
    let token = (await userStorage.getProfileFieldValue('loginToken')) || ''
    log.debug('got rewards login token', token)
    setToken(token)
  }, [])

  useEffect(() => {
    getToken()
    return () => store.set('loadingIndicator')({ loading: false })
  }, [])

  const onPressOk = useOnPress(() => {
    window.open(getRewardsPath(), '_blank')
  })

  const onDismiss = useOnPress(() => {
    props.navigation.navigate('Home')
  }, [props.navigation])

  useEffect(() => {
    if (openInNewTab && token) {
      store.set('loadingIndicator')({ loading: false })
      showDialog({
        title: 'Press ok to go to Rewards dashboard',
        buttons: [
          {
            text: 'OK',
            onPress: onPressOk,
          },
        ],
        onDismiss: onDismiss,
      })
    }
  }, [token])

  const src = getRewardsPath()
  const webIframesStyles = { flex: 1 }
  const Iframe = createIframe(src, 'Rewards', false, 'Home', webIframesStyles)
  const rewardsIframe = useMemo(() => <Iframe />, [src])

  if (openInNewTab || token === undefined) {
    return null
  }

  return rewardsIframe
}

RewardsTab.navigationOptions = {
  title: 'Invite',
}

export default RewardsTab
