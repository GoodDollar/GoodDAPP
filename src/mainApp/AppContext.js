import React from 'react'
import { PostHogProvider } from 'posthog-react-native'

import { GlobalTogglesContextProvider } from '../lib/contexts/togglesContext'
import { DialogContextProvider } from '../lib/dialog/dialogContext'
import { GoodWalletProvider } from '../lib/wallet/GoodWalletProvider'
import Config from '../config/config'

const AppContext = ({ children }) => (
  <PostHogProvider
    apiKey={Config.posthogApiKey}
    options={{
      host: Config.posthogHost,
      preloadFeatureFlags: true,
      bootstrap: {
        // by default assuming everything is okay and enable ff'ed features
        // will be overriden by the actual feature flags once posthog is loaded
        featureFlags: {
          'show-usd-balance': true,
          'wallet-chat': true,
          'micro-bridge': true,
          'send-receive-feature': true,
          'dashboard-buttons': true,
          'claim-feature': {
            enabled: true,
            message: '', // only used for when disabled
          },
        },
      },
    }}
    autocapture={false}
  >
    <GlobalTogglesContextProvider>
      <DialogContextProvider>
        <GoodWalletProvider>{children}</GoodWalletProvider>
      </DialogContextProvider>
    </GlobalTogglesContextProvider>
  </PostHogProvider>
)

export default AppContext
