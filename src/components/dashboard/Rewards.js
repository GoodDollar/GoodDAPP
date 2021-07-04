import React, { useCallback, useEffect, useMemo, useState } from 'react'

// import { isIOS } from 'mobile-device-detect'
import { get, isNil } from 'lodash'

import { Iframe } from '../webView/iframe'

import { useDialog, useErrorDialog } from '../../lib/undux/utils/dialog'
import useLoadingIndicator from '../../lib/hooks/useLoadingIndicator'

import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import { openLink } from '../../lib/utils/linking'

import userStorage from '../../lib/userStorage/UserStorage'

const log = logger.child({ from: 'RewardsTab' })

const RewardsTab = ({ navigation, openInNewTab = false /* TODO: isIOS */ }) => {
  const [showDialog] = useDialog()
  const [showErrorDialog] = useErrorDialog()
  const [token, setToken] = useState(null)
  const [showLoading, hideLoading] = useLoadingIndicator()

  const params = get(navigation, 'state.params', {})

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

  const onDismiss = useCallback(() => navigation.navigate('Home'), [navigation])

  const onPressOk = useCallback(async () => {
    try {
      await openLink(rewardsPath, '_blank')
    } catch (exception) {
      const { message } = exception

      log.error('Failed opening external link:', message, exception, { rewardsPath })
      showErrorDialog(message, '', { onDismiss })
    }
  }, [rewardsPath, onDismiss])

  useEffect(() => {
    showLoading()

    userStorage.getProfileFieldValue('loginToken').then(loginToken => {
      const token = loginToken || ''

      log.debug('Got rewards login token', token)
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
      onDismiss,
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
