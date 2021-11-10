import React from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import { theme as defaultTheme } from '../../components/theme/styles'
import SimpleStore from '../../lib/undux/SimpleStore'
import GDStore from '../../lib/undux/GDStore'
import { GlobalTogglesContextProvider } from '../../lib/contexts/togglesContext'

export const StoresWrapper = ({ children }) => {
  return (
    <GlobalTogglesContextProvider>
      <GDStore.Container>
        <SimpleStore.Container>{children}</SimpleStore.Container>
      </GDStore.Container>
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
    <SimpleStore.Container>
      <Component {...props} />
    </SimpleStore.Container>
  </GlobalTogglesContextProvider>
)

export const withThemeProvider = (Component, theme = defaultTheme) => props => (
  <PaperProvider theme={theme}>
    <StoresWrapper>
      <Component {...props} />
    </StoresWrapper>
  </PaperProvider>
)
