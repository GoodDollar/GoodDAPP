import React from 'react'
import { PostHogProvider } from 'posthog-react-native'
import { GoodIdContextProvider } from '@gooddollar/web3sdk-v2'

import { NativeBaseProvider, theme as NBTheme } from '@gooddollar/good-design'

import { GlobalTogglesContextProvider } from '../lib/contexts/togglesContext'
import { DialogContextProvider } from '../lib/dialog/dialogContext'
import { GoodWalletProvider } from '../lib/wallet/GoodWalletProvider'
import Config from '../config/config'

const AppContext = ({ children }) => (
  <PostHogProvider
    apiKey={Config.posthogApiKey}
    options={{ host: Config.posthogHost, preloadFeatureFlags: true, sendFeatureFlagEvent: false }}
    autocapture={false}
  >
    <GlobalTogglesContextProvider>
      <GoodIdContextProvider>
        <DialogContextProvider>
          <GoodWalletProvider>
            <NativeBaseProvider config={{ suppressColorAccessibilityWarning: true }} theme={NBTheme}>
              {children}
            </NativeBaseProvider>
          </GoodWalletProvider>
        </DialogContextProvider>
      </GoodIdContextProvider>
    </GlobalTogglesContextProvider>
  </PostHogProvider>
)

export default AppContext
