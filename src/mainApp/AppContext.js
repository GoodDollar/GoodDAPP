import React from 'react'

import { GlobalTogglesContextProvider } from '../lib/contexts/togglesContext'
import { DialogContextProvider } from '../lib/dialog/dialogContext'
import { GoodWalletProvider } from '../lib/wallet/GoodWalletProvider'
import { WalletConnectContextProvider } from '../lib/wallet/thirdparty/WalletConnectProvider'

const AppContext = ({ children }) => (
  <GlobalTogglesContextProvider>
    <DialogContextProvider>
      <WalletConnectContextProvider>
        <GoodWalletProvider>{children}</GoodWalletProvider>
      </WalletConnectContextProvider>
    </DialogContextProvider>
  </GlobalTogglesContextProvider>
)

export default AppContext
