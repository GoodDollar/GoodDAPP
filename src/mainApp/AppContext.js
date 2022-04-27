import React from 'react'

import { GlobalTogglesContextProvider } from '../lib/contexts/togglesContext'
import { DialogContextProvider } from '../lib/dialog/dialogContext'
import { GoodWalletProvider } from '../lib/wallet/GoodWalletProvider'
import { UserContextProvider } from '../lib/contexts/userContext'

const AppContext = ({ children }) => (
  <GlobalTogglesContextProvider>
    <DialogContextProvider>
      <GoodWalletProvider>
        <UserContextProvider>{children}</UserContextProvider>
      </GoodWalletProvider>
    </DialogContextProvider>
  </GlobalTogglesContextProvider>
)

export default AppContext
