import React from 'react'
import MetaTags from 'react-meta-tags'

import Config from '../../config/config'

import 'smartbanner.js/dist/smartbanner.min.js'
import 'smartbanner.js/dist/smartbanner.min.css'
import './smartbanner-custom-style.css'

const SmartBanner = () => (
  <MetaTags>
    <meta name="smartbanner:title" content="GoodDollar - Claim crypto UBI" />
    <meta name="smartbanner:author" content="GoodDollar" />
    <meta name="smartbanner:price" content="FREE" />
    <meta name="smartbanner:price-suffix-google" content=" - In Google Play" />
    <meta name="smartbanner:icon-google" content={Config.storeAppIconAndroid} />
    <meta name="smartbanner:button" content="GET" />
    <meta name="smartbanner:button-url-google" content={Config.storeAppUrlAndroid} />
    <meta name="smartbanner:enabled-platforms" content="android" />
    <meta name="smartbanner:close-label" content="Close" />
  </MetaTags>
)

export default SmartBanner
