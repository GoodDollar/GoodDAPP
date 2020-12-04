import React, { useCallback, useEffect } from 'react'
import { WebView } from 'react-native-webview'

import { getMaxDeviceHeight } from '../../lib/utils/sizes'
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

export const createIframe = (src, title, backToWallet = false, styles) => {
  const IframeTab = () => <Iframe title={title} src={src} />

  IframeTab.navigationOptions = { title, backToWallet }

  return IframeTab
}
