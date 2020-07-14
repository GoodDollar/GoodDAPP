import React, { useEffect } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Appbar } from 'react-native-paper'
import Section from '../common/layout/Section'
import Icon from '../common/view/Icon'
import SimpleStore from '../../lib/undux/SimpleStore'
import { getMaxDeviceHeight } from '../../lib/utils/Orientation'

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

    //this is for our external pages like privacy policy, etc.. they dont require iframeresizer to work ok on ios <13
    return (
      <iframe
        allowFullScreen
        title={title}
        seamless
        frameBorder="0"
        onLoad={isLoaded}
        src={src}
        width="100%"
        height="100%"
        style={styles ? styles : { height: wHeight }}
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
      textTransform: 'uppercase',
    },
    walletIcon: {
      position: 'absolute',
      right: 15,
    },
  }

  if (backToWallet) {
    const NavigationBar = navigate => (
      <Appbar.Header dark style={navBarStyles.wrapper}>
        <View style={{ width: 48 }} />
        <Appbar.Content />
        <Section.Text color="white" fontWeight="medium" style={navBarStyles.title} testID="rewards_header">
          {title}
        </Section.Text>
        <Appbar.Content />
        <TouchableOpacity onPress={() => navigate(backToRoute)} style={navBarStyles.walletIcon}>
          <Icon name="wallet" size={36} color="white" />
        </TouchableOpacity>
      </Appbar.Header>
    )

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
  return IframeTab
}
