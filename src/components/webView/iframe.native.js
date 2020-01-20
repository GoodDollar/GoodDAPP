import React, { useEffect } from 'react'
import { WebView } from 'react-native-webview'
import SimpleStore from '../../lib/undux/SimpleStore'
import { getMaxDeviceHeight } from '../../lib/utils/Orientation'

const wHeight = getMaxDeviceHeight()

export const createIframe = (src, title) => {
  const IframeTab = props => {
    const store = SimpleStore.useStore()

    const isLoaded = () => {
      store.set('loadingIndicator')({ loading: false })
    }

    useEffect(() => {
      store.set('loadingIndicator')({ loading: true })
    }, [])

    return <WebView title={title} onLoad={isLoaded} source={{ uri: src }} style={{ height: wHeight }} />
  }
  IframeTab.navigationOptions = {
    title,
  }
  return IframeTab
}
