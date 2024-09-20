// @flow
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import React from 'react'
import { GoodUIi18nProvider } from '@gooddollar/good-design'
import '../lib/shim'

import LanguageProvider from '../language/i18n'
import AppHot from './AppHot'

const AppHolder = () => (
  <GoodUIi18nProvider>
    <LanguageProvider>
      <ActionSheetProvider>
        <AppHot />
      </ActionSheetProvider>
    </LanguageProvider>
  </GoodUIi18nProvider>
)

export default AppHolder
