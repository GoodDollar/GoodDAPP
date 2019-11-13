import React, { useEffect } from 'react'
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

    //this is for our external pages like privacy policy, etc.. they dont require iframeresizer to work ok on ios <13
    return (
      <iframe
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
  IframeTab.navigationOptions = {
    title,
  }
  return IframeTab
}
