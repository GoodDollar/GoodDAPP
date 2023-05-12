import React from 'react'

import SmartBanner from '../components/smartbanner/SmartBanner'
import Config from '../config/config'
import AppHolder from './AppHolder'

const WalletApp = () => (
  <>
    {!Config.isDeltaApp && <SmartBanner />}
    <AppHolder />
  </>
)

export default WalletApp
