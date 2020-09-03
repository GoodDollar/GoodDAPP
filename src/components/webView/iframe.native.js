import React, { useCallback, useEffect } from 'react'
import { WebView } from 'react-native-webview'
import { TouchableOpacity, View } from 'react-native'
import { Appbar } from 'react-native-paper'

import Section from '../common/layout/Section'
import Icon from '../common/view/Icon'

import { getMaxDeviceHeight } from '../../lib/utils/sizes'
import useOnPress from '../../lib/hooks/useOnPress'
import useLoadingIndicator from '../../lib/hooks/useLoadingIndicator'

const wHeight = getMaxDeviceHeight()

const DOMLoadedDispatcher = `(function () {
    var messenger = window.ReactNativeWebView || parent;

    if (!messenger || ('function' !== (typeof messenger.postMessage))) {
      return;
    }

    var documentUrl = location.href;
    var DOMReady = 'DOMContentLoaded';

    var onDOMContentLoaded = function() {
      var messagePayload = {
        event: DOMReady,
        target: 'iframe',
        src: documentUrl
      };

      messenger.postMessage(messagePayload, '*');
    }

    if (document.readyState !== 'loading') {
      onDOMContentLoaded();
      return;
    }

    window.addEventListener(DOMReady, onDOMContentLoaded);
  })();`

export const Iframe = ({ src, title }) => {
  const [showLoading, hideLoading] = useLoadingIndicator()

  const onMessage = useCallback(
    ({ nativeEvent: { data } }) => {
      const { event } = data

      if ('DOMContentLoaded' === event) {
        hideLoading()
      }
    },
    [hideLoading],
  )

  useEffect(showLoading, [])

  return (
    <WebView
      title={title}
      onLoad={hideLoading}
      source={{ uri: src }}
      style={{ height: wHeight }}
      originWhitelist={['*']}
      javaScriptEnabledAndroid={true}
      injectedJavaScript={DOMLoadedDispatcher}
      onMessage={onMessage}
    />
  )
}

export const createIframe = (src, title, backToWallet = false, backToRoute = 'Home', styles) => {
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

    const NavigationBar = ({ navigate }) => {
      const goBack = useOnPress(() => navigate(backToRoute), [backToRoute, navigate])

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
      navigationBar: () => <NavigationBar navigate={navigation.navigate} />,
    })
  }

  return IframeTab
}
