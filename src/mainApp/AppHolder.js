// @flow

import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { deleteGunDB } from '../lib/hooks/useDeleteAccountDialog'
import Config from '../config/config'
import SimpleStore from '../lib/undux/SimpleStore'
import AsyncStorage from '../lib/utils/asyncStorage'
import AppStore from './AppStore'

import '../lib/gundb/gundb'

const AppHolder = () => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return
    }

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

    upgradeVersion().then(() => setReady(true))
  }, [setReady])

  if (!ready) {
    return null
  }

  return (
    <ActionSheetProvider>
      <SimpleStore.Container>
        <AppStore />
      </SimpleStore.Container>
    </ActionSheetProvider>
  )
}

export default AppHolder
