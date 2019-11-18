import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import IframeResizer from 'iframe-resizer-react'
import { isIOS, osVersion } from 'mobile-device-detect'
import { Appbar } from 'react-native-paper'
import _get from 'lodash/get'
import _toPairs from 'lodash/toPairs'
import userStorage from '../../lib/gundb/UserStorage'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import SimpleStore from '../../lib/undux/SimpleStore'
import Section from '../common/layout/Section'
import Icon from '../common/view/Icon'
import { useDialog } from '../../lib/undux/utils/dialog'

const log = logger.child({ from: 'RewardsTab' })

const RewardsTab = props => {
  const [token, setToken] = useState()
  const store = SimpleStore.useStore()
  const [showDialog] = useDialog()

  const scrolling = isIOS ? 'no' : 'yes'

  const getRewardsPath = () => {
    const params = _get(props, 'navigation.state.params', {})
    if (isIOS === false) {
      params.purpose = 'iframe'
    }
    params.token = token
    let path = decodeURIComponent(_get(params, 'rewardsPath', ''))
    delete params.rewardsPath
    const query = _toPairs(params)
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
  }, [])

  useEffect(() => {
    if (isIOS && token) {
      store.set('loadingIndicator')({ loading: false })
      showDialog({
        title: 'Press ok to go to Rewards dashboard',
        onDismiss: () => {
          window.open(getRewardsPath(), '_blank')
          props.navigation.navigate('Home')
        },
      })
    }
  }, [token])

  if (isIOS || token === undefined) {
    return null
  }

  const src = getRewardsPath()
  if (isIOS === false || osVersion >= 13) {
    return <iframe title="Rewards" onLoad={isLoaded} src={src} seamless frameBorder="0" style={{ flex: 1 }} />
  }
  return token === undefined ? null : (
    <IframeResizer
      title="Rewards"
      scrolling={scrolling}
      src={src}
      allowFullScreen
      checkOrigin={false}
      frameBorder="0"
      seamless
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        minWidth: '100%',
        minHeight: '100%',
        width: 0,
        flex: 1,
      }}
      onLoad={isLoaded}
    />
  )
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
    <Section.Text color="white" fontWeight="medium" style={navBarStyles.title}>
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
