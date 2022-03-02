import * as React from 'react'

import WalletConnectProvider from '@walletconnect/react-native-dapp'
import AsyncStorage from '@react-native-async-storage/async-storage'
import QRCodeModal from '@walletconnect/qrcode-modal'
import { Platform } from 'react-native'

export default function _WalletConnectProvider({ children }) {
  return (
    <WalletConnectProvider
      redirectUrl={Platform.OS === 'web' ? window.location.origin : 'gooddollar://'}
      storageOptions={{
        asyncStorage: AsyncStorage,
      }}
      bridge="https://bridge.walletconnect.org"
      clientMeta={{
        description: 'Connect with WalletConnect',
        url: 'https://walletconnect.org',
        icons: ['https://walletconnect.org/walletconnect-logo.png'],
        name: 'WalletConnect',
      }}
      {...(Platform.OS === 'web' ? { qrcodeModal: QRCodeModal } : {})}
    >
      {children}
    </WalletConnectProvider>
  )
}
