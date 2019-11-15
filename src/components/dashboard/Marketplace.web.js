import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Appbar } from 'react-native-paper'
import Config from '../../config/config'
import SimpleStore from '../../lib/undux/SimpleStore'
import Icon from '../common/view/Icon'
import Section from '../common/layout/Section'
import { useDialog } from '../../lib/undux/utils/dialog'
import getMarketToken from './utils/getMarketToken'

const isMarketDialog = true
const MarketTab = props => {
  const [loginToken, setLoginToken] = useState()
  const [openDialog] = useState(true)
  const store = SimpleStore.useStore()
  const isLoaded = () => {
    store.set('loadingIndicator')({ loading: false })
  }
  const [showDialog] = useDialog()
  useEffect(() => {
    store.set('loadingIndicator')({ loading: true })
    getMarketToken(setLoginToken)
    if (isMarketDialog && openDialog) {
      showDialog({
        message: 'Press ok to go to market',
        buttons: [
          {
            text: 'Ok',
            onPress: () => {
              window.open(`${Config.marketUrl}?jwt=${loginToken}&nofooter=true`, '_self')
            },
          },
        ],
      })
    }
  }, [])

  if ((isMarketDialog && openDialog) || loginToken === undefined) {
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
    right: 5,
    bottom: -5,
  },
}

const NavigationBar = navigate => (
  <Appbar.Header dark style={navBarStyles.wrapper}>
    <Section.Text color="white" fontWeight="medium" style={navBarStyles.title}>
      {'GOODMARKET'}
    </Section.Text>
    <TouchableOpacity onPress={() => navigate('Home')} style={navBarStyles.walletIcon}>
      <Icon name="wallet" size={55} color="white" />
    </TouchableOpacity>
  </Appbar.Header>
)

MarketTab.navigationOptions = ({ navigation }) => {
  return {
    navigationBar: () => NavigationBar(navigation.navigate),
  }
}

export default MarketTab
