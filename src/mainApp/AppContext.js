import React from 'react'

import { GlobalTogglesContextProvider } from '../lib/contexts/togglesContext'
import { DialogContextProvider } from '../lib/dialog/dialogContext'
import { GoodWalletProvider } from '../lib/wallet/GoodWalletProvider'

const AppContext = ({ children }) => (
  <GlobalTogglesContextProvider>
    <DialogContextProvider>
      <GoodWalletProvider>{children}</GoodWalletProvider>
    </DialogContextProvider>
  </GlobalTogglesContextProvider>
)

export default AppContext
