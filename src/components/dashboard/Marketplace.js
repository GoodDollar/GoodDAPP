// TODO: RN
import React, { useEffect, useMemo, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Appbar } from 'react-native-paper'
import { isIOS } from 'mobile-device-detect'
import _get from 'lodash/get'
import _toPairs from 'lodash/toPairs'
import Config from '../../config/config'
import SimpleStore from '../../lib/undux/SimpleStore'
import Icon from '../common/view/Icon'
import Section from '../common/layout/Section'
import { useDialog } from '../../lib/undux/utils/dialog'
import userStorage from '../../lib/gundb/UserStorage'
import { createIframe } from '../webView/iframe'

const MarketTab = props => {
  const [token, setToken] = useState()
  const store = SimpleStore.useStore()
  const [showDialog] = useDialog()

  const getMarketPath = () => {
    const params = _get(props, 'navigation.state.params', {})
    if (isIOS == false) {
      params.nofooter = true
    }
    params.jwt = token
    let path = decodeURIComponent(_get(params, 'marketPath', ''))

    const query = _toPairs(params)
      .filter(param => param.indexOf('marketPath') < 0)
      .map(param => param.join('='))
      .join('&')

    return `${Config.marketUrl}/${path}?${query}`
  }

  const isLoaded = () => {
    store.set('loadingIndicator')({ loading: false })
  }

  useEffect(() => {
    store.set('loadingIndicator')({ loading: true })
    userStorage.getProfileFieldValue('marketToken').then(setToken)
  }, [])

  useEffect(() => {
    if (isIOS && token) {
      store.set('loadingIndicator')({ loading: false })
      showDialog({
        title: 'Press ok to go to market',
        buttons: [
          {
            text: 'OK',
            onPress: () => {
              window.open(getMarketPath(), '_blank')
            },
          },
        ],
        onDismiss: () => {
          props.navigation.navigate('Home')
        },
      })
    }
  }, [token])

  const src = getMarketPath()
  const webIframesStyles = { flex: 1, overflow: 'scroll' }
  const Iframe = createIframe(src, 'GoodMarket', isLoaded, webIframesStyles)

  const marketIframe = useMemo(() => {
    return <Iframe src={src} title="GoodMarket" />
  }, [src])

  if (isIOS || token === undefined) {
    return null
  }

  return marketIframe
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
    <Section.Text color="white" fontWeight="medium" style={navBarStyles.title}>
      {'GOODMARKET'}
    </Section.Text>
    <TouchableOpacity onPress={() => navigate('Home')} style={navBarStyles.walletIcon}>
      <Icon name="wallet" size={36} color="white" />
    </TouchableOpacity>
  </Appbar.Header>
)

MarketTab.navigationOptions = ({ navigation }) => {
  return {
    navigationBar: () => NavigationBar(navigation.navigate),
  }
}

export default MarketTab
