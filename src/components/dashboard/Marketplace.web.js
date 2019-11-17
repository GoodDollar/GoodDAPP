import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Appbar } from 'react-native-paper'
import { isMobileSafari } from 'mobile-device-detect'
import Config from '../../config/config'
import SimpleStore from '../../lib/undux/SimpleStore'
import Icon from '../common/view/Icon'
import Section from '../common/layout/Section'
import { useDialog } from '../../lib/undux/utils/dialog'
import getMarketToken from './utils/getMarketToken'

const MarketTab = props => {
  const [loginToken, setLoginToken] = useState()
  const store = SimpleStore.useStore()
  store.set('loadingIndicator')({ loading: true })
  const isLoaded = () => {
    store.set('loadingIndicator')({ loading: false })
  }
  const [showDialog] = useDialog()
  useEffect(() => {
    getMarketToken(setLoginToken)
  }, [])

  useEffect(() => {
    if (isMobileSafari && loginToken) {
      store.set('loadingIndicator')({ loading: false })
      showDialog({
        message: 'Press ok to go to market',
        buttons: [
          {
            text: 'Ok',
            onPress: () => {
              window.open(`${Config.marketUrl}?jwt=${loginToken}&nofooter=true`, '_blank')
            },
          },
        ],
      })
    }
  }, [loginToken])

  if (isMobileSafari || loginToken === undefined) {
    return null
  }
  const src = `${Config.marketUrl}?jwt=${loginToken}&nofooter=true`

  //this is for paperclip external market, doesnt seem like it requires iframeresizer to work in ios
  return (
    <iframe
      title="GoodMarket"
      onLoad={isLoaded}
      src={src}
      seamless
      frameBorder="0"
      style={{ flex: 1, overflow: 'scroll' }}
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
