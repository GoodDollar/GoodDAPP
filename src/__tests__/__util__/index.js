import React from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import { theme as defaultTheme } from '../../components/theme/styles'
import SimpleStore from '../../lib/undux/SimpleStore'
import GDStore from '../../lib/undux/GDStore'

export const StoresWrapper = ({ children }) => {
  return (
    <GDStore.Container>
      <SimpleStore.Container>{children}</SimpleStore.Container>
    </GDStore.Container>
  )
}

export const withThemeProvider = (Component, theme = defaultTheme) => props => (
  <PaperProvider theme={theme}>
    <StoresWrapper>
      <Component {...props} />
    </StoresWrapper>
  </PaperProvider>
)

export const withSimpleStateProvider = (Component, theme = defaultTheme) => props => (
  <SimpleStore.Container>
    <Component {...props} />
  </SimpleStore.Container>
)
