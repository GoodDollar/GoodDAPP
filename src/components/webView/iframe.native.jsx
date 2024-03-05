import React, { useCallback, useEffect } from 'react'
import { WebView } from 'react-native-webview'

import useLoadingIndicator from '../../lib/hooks/useLoadingIndicator'

const DOMReady = 'DOMContentLoaded'
const DOMLoadedDispatcher = `(function () {
    var messenger = window.ReactNativeWebView;

    if ('undefined' === typeof messenger) {
      return;
    }

    var onDOMContentLoaded = function() {
      messenger.postMessage('${DOMReady}');
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
      if (DOMReady === data) {
        hideLoading()
      }
    },
    [hideLoading],
  )

  useEffect(() => {
    showLoading()
    return hideLoading
  }, [])

  return (
    <WebView
      title={title}
      onLoad={hideLoading}
      source={{ uri: src }}
      scrollEnabled={true}
      automaticallyAdjustContentInsets={false}
      originWhitelist={['*']}
      injectedJavaScript={DOMLoadedDispatcher}
      onMessage={onMessage}
    />
  )
}

export const createIframe = (src, title, backToWallet = false) => {
  const IframeTab = () => <Iframe title={title} src={src} />

  IframeTab.navigationOptions = { title, backToWallet }

  return IframeTab
}
