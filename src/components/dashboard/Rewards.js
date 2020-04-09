import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Appbar } from 'react-native-paper'
import { get, toPairs } from 'lodash'
import { isIOSWeb } from '../../lib/utils/platform'
import userStorage from '../../lib/gundb/UserStorage'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import SimpleStore from '../../lib/undux/SimpleStore'
import Section from '../common/layout/Section'
import Icon from '../common/view/Icon'
import { useDialog } from '../../lib/undux/utils/dialog'
import { createIframe } from '../webView/iframe'

const log = logger.child({ from: 'RewardsTab' })

const RewardsTab = props => {
  const [token, setToken] = useState()
  const store = SimpleStore.useStore()
  const [showDialog] = useDialog()

  const getRewardsPath = () => {
    const params = get(props, 'navigation.state.params', {})

    if (isIOSWeb === false) {
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
  }, [])

  useEffect(() => {
    if (isIOSWeb && token) {
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
  const webIframesStyles = { flex: 1 }
  const Iframe = createIframe(src, 'Rewards', webIframesStyles)
  const rewardsIframe = useMemo(() => <Iframe />, [src])

  if (isIOSWeb || token === undefined) {
    return null
  }

  return rewardsIframe
}

const navBarStyles = {
  wrapper: {
    position: 'relative',
  },
  title: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  walletIcon: {
    position: 'absolute',
    right: 15,
  },
}

const NavigationBar = navigate => (
  <Appbar.Header dark style={navBarStyles.wrapper}>
    <View style={{ width: 48 }} />
    <Appbar.Content />
    <Section.Text color="white" fontWeight="medium" style={navBarStyles.title} testID="rewards_header">
      {'REWARDS'}
    </Section.Text>
    <Appbar.Content />
    <TouchableOpacity onPress={() => navigate('Home')} style={navBarStyles.walletIcon}>
      <Icon name="wallet" size={36} color="white" />
    </TouchableOpacity>
  </Appbar.Header>
)

RewardsTab.navigationOptions = ({ navigation }) => {
  return {
    navigationBar: () => NavigationBar(navigation.navigate),
  }
}

export default RewardsTab
