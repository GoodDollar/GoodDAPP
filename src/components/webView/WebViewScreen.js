import React from 'react'
import WebView from 'react-native-web-webview'

const WebViewScreen = props => {
  return <WebView source={{ uri: props.source }} style={{ flex: 1 }} />
}

export default WebViewScreen

export const createWebViewScreen = (source, title) => {
  const CurrentWebView = () => <WebViewScreen source={source} />
  CurrentWebView.navigationOptions = {
    title,
  }
  return CurrentWebView
}
