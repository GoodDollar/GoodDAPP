import React from 'react'
import WebView from 'react-native-web-webview' // eslint-disable-line import/no-unresolved
import _get from 'lodash/get'

const WebViewScreen = props => {
  const { source, title, ...rest } = props

  return <WebView source={{ uri: source }} style={{ flex: 1 }} {...rest} />
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

    return <WebViewScreen source={source} title={title} />
  }

  CurrentWebView.navigationOptions = {
    title,
  }
  return CurrentWebView
}
