import React, { useEffect } from 'react'
import IframeResizer from 'iframe-resizer-react'
import { isIOS, osVersion } from 'mobile-device-detect'
import SimpleStore from '../../lib/undux/SimpleStore'

export const createIframe = (src, title) => {
  const IframeTab = props => {
    const store = SimpleStore.useStore()
    const scrolling = isIOS ? 'no' : 'yes'

    const isLoaded = () => {
      store.set('loadingIndicator')({ loading: false })
    }

    useEffect(() => {
      store.set('loadingIndicator')({ loading: true })
    }, [])

    if (isIOS === false || osVersion > 13) {
      return <iframe title={title} seamless frameBorder="0" onLoad={isLoaded} src={src} style={{ flex: 1 }} />
    }
    return (
      <IframeResizer
        title={title}
        scrolling={scrolling}
        src={src}
        frameBorder="0"
        seamless
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          minWidth: '100%',
          minHeight: '100%',
          width: 0,
          flex: 1,
        }}
        onLoad={isLoaded}
      />
    )
  }
  IframeTab.navigationOptions = {
    title,
  }
  return IframeTab
}
