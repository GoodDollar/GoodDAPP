import React, { useContext, useEffect, useState } from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import { theme as defaultTheme } from '../../components/theme/styles'

import { GlobalTogglesContextProvider } from '../../lib/contexts/togglesContext'
import { GoodWalletContext, GoodWalletProvider } from '../../lib/wallet/GoodWalletProvider'
import { DialogContextProvider } from '../../lib/dialog/dialogContext'
import LanguageProvider from '../../language/i18n'

export const StoresWrapper = ({ children }) => {
  return (
    <GlobalTogglesContextProvider>
      <DialogContextProvider>
        <GoodWalletProvider disableLoginAndWatch>{children}</GoodWalletProvider>
      </DialogContextProvider>
    </GlobalTogglesContextProvider>
  )
}

export const withStoresProvider = Component => props => (
  <StoresWrapper>
    <Component {...props} />
  </StoresWrapper>
)

export const withUserStorage = Component => props => {
  const [isReady, setReady] = useState(false)
  const { initWalletAndStorage } = useContext(GoodWalletContext)
  useEffect(() => {
    initWalletAndStorage &&
      initWalletAndStorage(
        'burger must derive wrong dry unaware reopen laptop acoustic report slender scene',
        'SEED',
      ).then(_ => setReady(true))
  }, [initWalletAndStorage])

  return isReady ? <Component {...props} /> : null
}
export const withSimpleStateProvider = Component => props => (
  <GlobalTogglesContextProvider>
    <Component {...props} />
  </GlobalTogglesContextProvider>
)

export const withThemeProvider = (Component, theme = defaultTheme) => {
  const C = withUserStorage(Component)
  return props => (
    <PaperProvider theme={theme}>
      <StoresWrapper>
        <C {...props} />
      </StoresWrapper>
    </PaperProvider>
  )
}

export const withThemeAndLocalizationProvider = (Component, theme = defaultTheme) => {
  const C = withUserStorage(Component)
  return props => (
    <PaperProvider theme={theme}>
      <LanguageProvider>
        <StoresWrapper>
          <C {...props} />
        </StoresWrapper>
      </LanguageProvider>
    </PaperProvider>
  )
}
