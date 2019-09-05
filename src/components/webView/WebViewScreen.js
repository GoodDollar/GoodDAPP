import React from 'react'
import WebView from 'react-native-web-webview'
import _get from 'lodash/get'

const WebViewScreen = props => {
  return <WebView source={{ uri: props.source }} style={{ flex: 1 }} />
}

export default WebViewScreen

export const createWebViewScreen = (source, title) => {
  const CurrentWebView = props => {
    const { navigation } = props
    let loginToken

    switch (title) {
      case 'Rewards':
        loginToken = _get(navigation, 'state.params.loginToken')

        source += `?token=${loginToken}`
        break

      default:
        break
    }

    return <WebViewScreen source={source} />
  }

  CurrentWebView.navigationOptions = {
    title,
  }
  return CurrentWebView
}
