import React, { useEffect } from 'react'
import { WebView } from 'react-native-webview'
import { TouchableOpacity, View } from 'react-native'
import { Appbar } from 'react-native-paper'
import Section from '../common/layout/Section'
import Icon from '../common/view/Icon'
import SimpleStore from '../../lib/undux/SimpleStore'
import { getMaxDeviceHeight } from '../../lib/utils/Orientation'
import useOnPress from '../../lib/hooks/useOnPress'

const wHeight = getMaxDeviceHeight()

export const createIframe = (src, title, backToWallet = false, backToRoute = 'Home', styles) => {
  const IframeTab = props => {
    const store = SimpleStore.useStore()

    const isLoaded = () => {
      store.set('loadingIndicator')({ loading: false })
    }

    useEffect(() => {
      store.set('loadingIndicator')({ loading: true })
    }, [])

    return <WebView title={title} onLoad={isLoaded} source={{ uri: src }} style={{ height: wHeight }} />
  }

  if (backToWallet) {
    const navBarStyles = {
      wrapper: {
        position: 'relative',
      },
      title: {
        position: 'absolute',
        left: 0,
        right: 0,
        textTransform: 'uppercase',
      },
      walletIcon: {
        position: 'absolute',
        right: 15,
      },
    }

    const NavigationBar = navigate => {
      const handleNavigate = useOnPress(() => navigate(backToRoute), [navigate, backToRoute])
      return (
        <Appbar.Header dark style={navBarStyles.wrapper}>
          <View style={{ width: 48 }} />
          <Appbar.Content />
          <Section.Text color="white" fontWeight="medium" style={navBarStyles.title} testID="rewards_header">
            {title}
          </Section.Text>
          <Appbar.Content />
          <TouchableOpacity onPress={handleNavigate} style={navBarStyles.walletIcon}>
            <Icon name="wallet" size={36} color="white" />
          </TouchableOpacity>
        </Appbar.Header>
      )
    }
    IframeTab.navigationOptions = ({ navigation }) => {
      return {
        navigationBar: () => NavigationBar(navigation.navigate),
      }
    }
  } else {
    IframeTab.navigationOptions = {
      title,
    }
  }

  IframeTab.navigationOptions = {
    title,
  }
  return IframeTab
}
