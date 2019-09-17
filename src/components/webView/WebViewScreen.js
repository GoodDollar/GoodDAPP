import React from 'react'
import WebView from 'react-native-web-webview'
import _get from 'lodash/get'
import qs from 'qs'

const WebViewScreen = props => {
  return <WebView source={{ uri: props.source }} style={{ flex: 1 }} />
}

export default WebViewScreen

export const createWebViewScreen = (source, title) => {
  const CurrentWebView = props => {
    const { navigation } = props
    let loginToken
    let queryParams
    let splittedSource
    let sourceDomain
    let sourceQuery

    switch (title) {
      case 'Rewards':
        loginToken = _get(navigation, 'state.params.loginToken')
        splittedSource = source.split('?')
        sourceDomain = splittedSource[0]
        sourceQuery = splittedSource[1] || ''
        queryParams = qs.parse(sourceQuery)

        if (!queryParams.token || queryParams.token !== loginToken) {
          queryParams.token = loginToken
        }

        source = `${sourceDomain}?${qs.stringify(queryParams)}`
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
