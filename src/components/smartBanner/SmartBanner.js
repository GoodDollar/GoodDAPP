import React from 'react'
import Config from '../../config/config'

import '../../../node_modules/smartbanner.js/dist/smartbanner.min.js'

import '../../../node_modules/smartbanner.js/dist/smartbanner.min.css'

const SmartBannerMain = () => {
  return (
    <>
      <meta name="smartbanner:title" content="GoodDollar - Claim crypto UBI" />
      <meta name="smartbanner:author" content="GoodDollar" />
      <meta name="smartbanner:price" content="FREE" />
      <meta name="smartbanner:price-suffix-google" content=" - In Google Play" />
      <meta name="smartbanner:icon-google" content={Config.playStoreBannerImage} />
      <meta name="smartbanner:button" content="GET" />
      <meta name="smartbanner:button-url-google" content={Config.playStoreUrl} />
      <meta name="smartbanner:enabled-platforms" content="android" />
      <meta name="smartbanner:close-label" content="Close" />
    </>
  )
}

export default SmartBannerMain
