// @flow
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Paragraph } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import bip39 from 'bip39-light'
import { getMnemonics, saveMnemonics } from '../../lib/wallet/SoftwareWalletProvider'
import GDStore from '../../lib/undux/GDStore'
import logger from '../../lib/logger/pino-logger'
import { CustomButton } from '../common'
import MnemonicInput from './MnemonicInput'

//const TITLE = 'Recover my wallet'
const TITLE = 'Recover'
const log = logger.child({ from: TITLE })

const Mnemonics = () => {
  const [mnemonics, setMnemonics] = useState()
  const store = GDStore.useStore()

  const handleChange = (mnemonics: []) => {
    log.info({ mnemonics })
    setMnemonics(mnemonics.join(' '))
  }

  const recover = async () => {
    if (!mnemonics || !bip39.validateMnemonic(mnemonics)) {
      store.set('currentScreen')({
        dialogData: {
          visible: true,
          title: 'ERROR',
          message: 'Invalid Mnenomic',
          dismissText: 'OK'
        }
      })
      return
    }

    const prevMnemonics = await getMnemonics()

    try {
      // We need to try to get a new address using new mnenonics
      await saveMnemonics(mnemonics)

      // We validate that a user was registered for the specified mnemonics
      const profile = await retrieveCurrentGunProfile()

      if (profile) {
        // There is no error and Profile exists. Reload screen to start with users mnemonics
        window.location = '/'
      } else {
        log.error('No profile available for mnemonics')

        await saveMnemonics(prevMnemonics)

        store.set('currentScreen')({
          dialogData: {
            visible: true,
            title: 'ERROR',
            message: 'No user registered for specified mnemonics',
            dismissText: 'OK'
          }
        })
      }
    } catch (err) {
      log.error(err)
      saveMnemonics(prevMnemonics)
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.topContainer}>
        <View style={styles.textContainer}>
          <Paragraph style={[styles.fontBase, styles.paragraph]}>Please enter your 12-word passphrase:</Paragraph>
        </View>
        <View style={styles.formContainer}>
          <MnemonicInput onChange={handleChange} />
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <CustomButton mode="contained" onPress={recover} disabled={!mnemonics}>
          RECOVER MY WALLET
        </CustomButton>
      </View>
    </View>
  )
}

/**
 * Helper to retrieve current mnemonic associated gun's profile
 * @returns {Promise<Promise<*>|Promise<*>|Promise<any>>}
 */
async function retrieveCurrentGunProfile(): Promise<any> {
  // Instantiate goodWallet to use it as the userStorage constructor param
  const { GoodWallet } = await import('../../lib/wallet/GoodWallet')
  const goodWallet = new GoodWallet()
  await goodWallet.ready

  // Instantiate userStorage with the specified mnemonics
  const { UserStorage } = await import('../../lib/gundb/UserStorage')
  const userStorage = new UserStorage(goodWallet)
  await userStorage.ready

  // returns found profile for specified mnemonics
  return userStorage.profile.load().then()
}

Mnemonics.navigationOptions = {
  title: TITLE
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
    padding: '1em',
    justifyContent: 'space-between'
  },
  topContainer: {
    flex: 2,
    display: 'flex',
    justifyContent: 'center',
    padding: 0,
    margin: 0
  },
  bottomContainer: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  fontBase: {
    color: '#555555',
    textAlign: 'center'
  },
  inputs: {
    width: '0.45vw',
    height: '2rem',
    margin: '0 1rem',
    fontSize: '1rem',
    borderRadius: 4
  },
  paragraph: {
    fontSize: normalize(18),
    lineHeight: '1.2em'
  }
})

export default Mnemonics
