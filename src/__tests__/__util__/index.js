import React from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import { theme as defaultTheme } from '../../components/theme/styles'
import SimpleStore from '../../lib/undux/SimpleStore'
import GDStore from '../../lib/undux/GDStore'
import { GlobalTogglesContextProvider } from '../../lib/contexts/togglesContext'
import { UserContextProvider } from '../../lib/contexts/userContext'
import LanguageProvider from '../../language/i18n'

export const StoresWrapper = ({ children }) => {
  return (
    <GlobalTogglesContextProvider>
      <UserContextProvider>
        <GDStore.Container>
          <SimpleStore.Container>{children}</SimpleStore.Container>
        </GDStore.Container>
      </UserContextProvider>
    </GlobalTogglesContextProvider>
  )
}

export const withStoresProvider = Component => props => (
  <StoresWrapper>
    <Component {...props} />
  </StoresWrapper>
)

export const withSimpleStateProvider = Component => props => (
  <GlobalTogglesContextProvider>
    <UserContextProvider>
      <SimpleStore.Container>
        <Component {...props} />
      </SimpleStore.Container>
    </UserContextProvider>
  </GlobalTogglesContextProvider>
)

export const withThemeProvider = (Component, theme = defaultTheme) => props => {
  return (
    <PaperProvider theme={theme}>
      <StoresWrapper>
        <Component {...props} />
      </StoresWrapper>
    </PaperProvider>
  )
}

export const withThemeAndLocalizationProvider = (Component, theme = defaultTheme) => props => (
  <PaperProvider theme={theme}>
    <LanguageProvider>
      <StoresWrapper>
        <Component {...props} />
      </StoresWrapper>
    </LanguageProvider>
  </PaperProvider>
)
