import React, { useEffect } from 'react'
import MetaTags from 'react-meta-tags'

import Config from '../../config/config'

import 'smartbanner.js/dist/smartbanner.min.js'
import 'smartbanner.js/dist/smartbanner.min.css'
import './smartbanner.css'

const { suggestMobileApp, storeAppIconAndroid, storeAppUrlAndroid } = Config

const SmartBanner = () => {
  useEffect(() => {
    if (suggestMobileApp) {
      window.smartbanner.publish()
    }
  }, [])

  return suggestMobileApp ? (
    <MetaTags>
      <meta name="smartbanner:title" content="GoodDollar - Claim crypto UBI" />
      <meta name="smartbanner:author" content="GoodDollar" />
      <meta name="smartbanner:price" content="FREE" />
      <meta name="smartbanner:price-suffix-google" content=" - In Google Play" />
      <meta name="smartbanner:icon-google" content={storeAppIconAndroid} />
      <meta name="smartbanner:button" content="GET" />
      <meta name="smartbanner:button-url-google" content={storeAppUrlAndroid} />
      <meta name="smartbanner:enabled-platforms" content="android" />
      <meta name="smartbanner:close-label" content="Close" />
      <meta name="smartbanner:api" content="true" />
    </MetaTags>
  ) : null
}

export default SmartBanner
