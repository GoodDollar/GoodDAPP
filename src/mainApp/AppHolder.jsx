// @flow
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import React from 'react'
import { AnalyticsProvider } from '@gooddollar/web3sdk-v2'

import '../lib/shim'

import LanguageProvider from '../language/i18n'
import { appProps, analyticsConfig as config } from '../lib/analytics/GoodIdAnalytics'
import AppHot from './AppHot'

const AppHolder = () => (
  <LanguageProvider>
    <AnalyticsProvider {...{ config, appProps }}>
      <ActionSheetProvider>
        <AppHot />
      </ActionSheetProvider>
    </AnalyticsProvider>
  </LanguageProvider>
)

export default AppHolder
