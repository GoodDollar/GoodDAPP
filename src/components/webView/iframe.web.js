import React, { useEffect } from 'react'
import { getMaxDeviceHeight } from '../../lib/utils/sizes'
import useLoadingIndicator from '../../lib/hooks/useLoadingIndicator'
import { useIframeLoaded } from './iframe.hooks.web'

const wHeight = getMaxDeviceHeight()

export const Iframe = ({ src, title }) => {
  const [showLoading, hideLoading] = useLoadingIndicator()
  const isLoaded = useIframeLoaded(src, hideLoading)

  useEffect(showLoading, [])

  // this is for our external pages like privacy policy, etc.. they dont require iframeresizer to work ok on ios <13
  return (
    <iframe
      allowFullScreen
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

export const createIframe = (src, title, backToWallet = false) => {
  const IframeTab = () => <Iframe title={title} src={src} />

  IframeTab.navigationOptions = { title, backToWallet }

  return IframeTab
}
