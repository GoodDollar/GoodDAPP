import React from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import { theme as defaultTheme } from '../../components/theme/styles'

export const withThemeProvider = (Component, theme = defaultTheme) => props => (
  <PaperProvider theme={theme}>
    <Component {...props} />
  </PaperProvider>
)
