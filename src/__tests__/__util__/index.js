import React from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import { theme as defaultTheme } from '../../components/theme/styles'
import { StoresWrapper } from '../../lib/undux/utils/storeswrapper.js'

export const withThemeProvider = (Component, theme = defaultTheme) => props => (
  <PaperProvider theme={theme}>
    <StoresWrapper>
      <Component {...props} />
    </StoresWrapper>
  </PaperProvider>
)
