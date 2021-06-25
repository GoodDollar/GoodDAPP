// @flow

import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'

import '../lib/gundb/gundb'
import { IS_LOGGED_IN } from '../lib/constants/localStorage'
import { deleteGunDB } from '../lib/hooks/useDeleteAccountDialog'
import AsyncStorage from '../lib/utils/asyncStorage'

import Config from '../config/config'

import SimpleStore, { useCurriedSetters } from '../lib/undux/SimpleStore'
import AppHot from './AppHot'

const AppHolder = () => {
  const [ready, setReady] = useState(false)
  const [setIsLoggedIn] = useCurriedSetters(['isLoggedIn'])

  useEffect(() => {
    /**
     * decide if we need to clear storage
     */
    const upgradeVersion = async () => {
      const current = 'phase' + Config.phase
      const valid = ['phase1', current] //in case multiple versions are valid
      const version = await AsyncStorage.getItem('GD_version')

      if (valid.includes(version)) {
        return
      }

      const req = deleteGunDB()

      //remove all local data so its not cached and user will re-login
      await Promise.all([AsyncStorage.clear(), req.catch()])
      AsyncStorage.setItem('GD_version', current) // required for mnemonic recovery
    }

    const initStore = async () => {
      const isLoggedIn = await AsyncStorage.getItem(IS_LOGGED_IN)

      setIsLoggedIn(isLoggedIn)
    }

    const initializeApp = async () => {
      if (Platform.OS === 'web') {
        await upgradeVersion()
      }

      await initStore()
      setReady(true)
    }

    if (ready) {
      return
    }

    initializeApp()
  }, [ready, setReady, setIsLoggedIn])

  if (!ready) {
    return null
  }

  return (
    <ActionSheetProvider>
      <AppHot />
    </ActionSheetProvider>
  )
}

export default () => (
  <SimpleStore.Container>
    <AppHolder />
  </SimpleStore.Container>
)
