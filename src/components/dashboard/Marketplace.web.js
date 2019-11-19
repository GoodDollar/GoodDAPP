import React, { useEffect, useState } from 'react'
import _get from 'lodash/get'
import { TouchableOpacity } from 'react-native'
import { Appbar } from 'react-native-paper'
import userStorage from '../../lib/gundb/UserStorage'
import Config from '../../config/config'
import logger from '../../lib/logger/pino-logger'
import SimpleStore from '../../lib/undux/SimpleStore'
import API from '../../lib/API/api'
import Icon from '../common/view/Icon'
import Section from '../common/layout/Section'

const log = logger.child({ from: 'MarketTab' })

const MarketTab = props => {
  const [loginToken, setLoginToken] = useState()
  const store = SimpleStore.useStore()

  const getToken = async () => {
    try {
      let token = await userStorage.getProfileFieldValue('marketToken')
      if (token) {
        setLoginToken(token)
      }

      const newtoken = await API.getMarketToken().then(_ => _get(_, 'data.jwt'))
      if (newtoken !== undefined && newtoken !== token) {
        token = newtoken
        userStorage.setProfileField('marketToken', newtoken)
        if (token == null) {
          setLoginToken(newtoken)
        }
      }
      log.debug('got market login token', token)
      if (token == null) {
        //continue to market without login in
        setLoginToken('')
        throw new Error('empty market token')
      }
    } catch (e) {
      log.error(e, e.message)

      // showErrorDialog('Error login in to market, try again later or contact support', 'MARKETPLACE-1')
    }
  }
  const isLoaded = () => {
    store.set('loadingIndicator')({ loading: false })
  }

  useEffect(() => {
    store.set('loadingIndicator')({ loading: true })
    getToken()
  }, [])

  if (loginToken === undefined) {
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
