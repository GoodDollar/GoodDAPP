import React, { useEffect } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Appbar } from 'react-native-paper'

import Section from '../common/layout/Section'
import Icon from '../common/view/Icon'

import { getMaxDeviceHeight } from '../../lib/utils/sizes'
import useLoadingIndicator from '../../lib/hooks/useLoadingIndicator'
import useOnPress from '../../lib/hooks/useOnPress'
import { useIframeLoaded } from './iframe.hooks.web'

const wHeight = getMaxDeviceHeight()

export const Iframe = ({ src, title }) => {
  const [showLoading, hideLoading] = useLoadingIndicator()
  const isLoaded = useIframeLoaded(src, hideLoading)

  useEffect(showLoading, [])

  // this is for our external pages like privacy policy, etc.. they dont require iframeresizer to work ok on ios <13
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
      style={{ height: wHeight }}
    />
  )
}

export const createIframe = (src, title, backToWallet = false, backToRoute = 'Home') => {
  const IframeTab = () => <Iframe title={title} src={src} />

  IframeTab.navigationOptions = { title }

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

    const NavigationBar = ({ navigation }) => {
      const goBack = useOnPress(() => navigation.navigate(backToRoute))

      return (
        <Appbar.Header dark style={navBarStyles.wrapper}>
          <View style={{ width: 48 }} />
          <Appbar.Content />
          <Section.Text color="white" fontWeight="medium" style={navBarStyles.title} testID="rewards_header">
            {title}
          </Section.Text>
          <Appbar.Content />
          <TouchableOpacity onPress={goBack} style={navBarStyles.walletIcon}>
            <Icon name="wallet" size={36} color="white" />
          </TouchableOpacity>
        </Appbar.Header>
      )
    }

    IframeTab.navigationOptions = ({ navigation }) => ({
      navigationBar: () => <NavigationBar navigation={navigation} />,
    })
  }

  return IframeTab
}
