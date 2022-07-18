import React from 'react'
import { Platform } from 'react-native'
import WCProvider from '@walletconnect/react-native-dapp'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const WalletConnectContextProvider = ({ children }) =>
  Platform.OS === 'web' ? (
    <>{children}</>
  ) : (
    <WCProvider
      redirectUrl={'https://wallet.gooddollar.org'}
      storageOptions={{
        asyncStorage: AsyncStorage,
      }}
      bridge="https://bridge.walletconnect.org"
    >
      {children}
    </WCProvider>
  )
