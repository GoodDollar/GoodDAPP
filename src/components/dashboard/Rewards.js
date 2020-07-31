import React, { useEffect, useMemo, useState } from 'react'

// import { isIOS } from 'mobile-device-detect'
import { isNil } from 'lodash'

import { Iframe } from '../webView/iframe'

import { useDialog } from '../../lib/undux/utils/dialog'
import useLoadingIndicator from '../../lib/hooks/useLoadingIndicator'

import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'

import userStorage from '../../lib/gundb/UserStorage'

const log = logger.child({ from: 'RewardsTab' })

const RewardsTab = ({ navigation, openInNewTab = false /* TODO: isIOS */ }) => {
  const [showDialog] = useDialog()
  const { params = {} } = navigation.state
  const [token, setToken] = useState(null)
  const [showLoading, hideLoading] = useLoadingIndicator()

  const rewardsPath = useMemo(() => {
    if (!token) {
      return
    }

    const url = new URL(Config.web3SiteUrl)
    const { rewardsPath = '', ...query } = params
    const searchParams = new URLSearchParams(query)

    searchParams.append('token', token)

    if (!openInNewTab) {
      searchParams.append('purpose', 'iframe')
    }

    url.pathname = decodeURIComponent(rewardsPath)
    url.search = searchParams.toString()

    return url.toString()
  }, [token, params, openInNewTab])

  useEffect(() => {
    showLoading()

const onPressOk = useOnPress(() => window.open(getRewardsPath(), '_blank'), [getRewardsPath])
    userStorage.getProfileFieldValue('loginToken').then(loginToken => {
      const token = loginToken || ''

  const onDismiss = useOnPress(() => navigation.navigate('Home'), [navigation])
      log.debug('got rewards login token', token)
      setToken(token)
    })

    return hideLoading
  }, [])

  useEffect(() => {
    if (!openInNewTab || !token) {
      return
    }

    hideLoading()
    showDialog({
      title: 'Press ok to go to Rewards dashboard',
      onDismiss: onDismiss,
      buttons: [
        {
          text: 'OK',
          onPress: onPressOk,
        },
      ],
    })
  }, [token])

  if (openInNewTab || isNil(token)) {
    return null
  }

  return <Iframe title="Rewards" src={rewardsPath} />
}

RewardsTab.navigationOptions = {
  title: 'Invite',
}

export default RewardsTab
