import React from 'react'
import WebView from 'react-native-web-webview'
import { get as _get } from 'lodash'

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
