// @flow

import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { deleteGunDB } from '../lib/hooks/useDeleteAccountDialog'
import Config from '../config/config'
import SimpleStore, { initStore } from '../lib/undux/SimpleStore'
import GDStore from '../lib/undux/GDStore'
import AsyncStorage from '../lib/utils/asyncStorage'
import App from './AppHot'
import '../lib/gundb/gundb'

const AppHot = App

const AppHolder = () => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    /**
     * decide if we need to clear storage
     */
    const upgradeVersion = async () => {
      const valid = ['phase1', null] //in case multiple versions are valid
      const current = 'phase' + Config.phase
      valid.push(current)
      const version = await AsyncStorage.getItem('GD_version')
      if (valid.includes(version)) {
        return
      }

      const req = deleteGunDB()

      //remove all local data so its not cached and user will re-login
      await Promise.all([AsyncStorage.clear(), req.catch()])
      AsyncStorage.setItem('GD_version', current) // required for mnemonic recovery
    }

    ;(async () => {
      if (Platform.OS === 'web') {
        await upgradeVersion()
      }

      await initStore()
      setReady(true)
    })()
  }, [])

  if (!ready) {
    return null
  }

  return (
    <ActionSheetProvider>
      <SimpleStore.Container>
        <GDStore.Container>
          <AppHot />
        </GDStore.Container>
      </SimpleStore.Container>
    </ActionSheetProvider>
  )
}

export default AppHolder
