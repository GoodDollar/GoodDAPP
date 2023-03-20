// @flow
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import '../lib/shim'
import AsyncStorage from '../lib/utils/asyncStorage'

import Config from '../config/config'

import LanguageProvider from '../language/i18n'
import AppHot from './AppHot'

const AppHolder = () => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    /**
     * decide if we need to clear storage
     */
    const upgradeVersion = async () => {
      const valid = ['phase1', null] // in case multiple versions are valid
      const current = 'phase' + Config.phase

      valid.push(current)

      const version = await AsyncStorage.getItem('GD_version')

      if (valid.includes(version)) {
        return
      }

      // remove all local data so its not cached and user will re-login
      await Promise.all([AsyncStorage.clear()])
      AsyncStorage.safeSet('GD_version', current) // required for mnemonic recovery
    }

    const initializeApp = async () => {
      if (Platform.OS === 'web') {
        await upgradeVersion()
      }

      setReady(true)
    }

    if (ready) {
      return
    }

    initializeApp()
  }, [ready, setReady])

  if (!ready) {
    return null
  }

  return (
    <LanguageProvider>
      <ActionSheetProvider>
        <AppHot />
      </ActionSheetProvider>
    </LanguageProvider>
  )
}

export default AppHolder
