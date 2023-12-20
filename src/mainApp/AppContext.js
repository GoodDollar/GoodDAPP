import React from 'react'
import { PostHogProvider } from 'posthog-react-native'

import { GlobalTogglesContextProvider } from '../lib/contexts/togglesContext'
import { DialogContextProvider } from '../lib/dialog/dialogContext'
import { GoodWalletProvider } from '../lib/wallet/GoodWalletProvider'
import Config from '../config/config'

const AppContext = ({ children }) => (
  <PostHogProvider
    apiKey={Config.posthogApiKey}
    options={{ host: Config.posthogHost, preloadFeatureFlags: true }}
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
