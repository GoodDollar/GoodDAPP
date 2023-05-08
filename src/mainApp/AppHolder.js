// @flow
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import React from 'react'
import '../lib/shim'

import LanguageProvider from '../language/i18n'
import AppHot from './AppHot'

const AppHolder = () => (
  <LanguageProvider>
    <ActionSheetProvider>
      <AppHot />
    </ActionSheetProvider>
  </LanguageProvider>
)

export default AppHolder
