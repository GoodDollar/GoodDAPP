import React from 'react'
import { hot } from 'react-hot-loader/root'

import SmartBanner from '../components/smartBanner/SmartBanner'
import { App } from './App'

const WrappedApp = hot(App)

const AppHot = props => (
  <>
    <SmartBanner />
    <WrappedApp {...props} />
  </>
)
export default AppHot
