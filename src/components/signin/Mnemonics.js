// @flow
import React, { useState } from 'react'
import { AsyncStorage, StyleSheet, View } from 'react-native'
import { Paragraph } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import bip39 from 'bip39-light'
import get from 'lodash/get'
import logger from '../../lib/logger/pino-logger'
import CustomButton from '../common/buttons/CustomButton'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import MnemonicInput from './MnemonicInput'

//const TITLE = 'Recover my wallet'
const TITLE = 'Recover'
const log = logger.child({ from: TITLE })

const Mnemonics = props => {
  //lazy load heavy wallet stuff for fast initial app load (part of initial routes)
  const mnemonicsHelpers = import('../../lib/wallet/SoftwareWalletProvider')
  const [mnemonics, setMnemonics] = useState()
  const [showErrorDialog] = useErrorDialog()

  const handleChange = (mnemonics: []) => {
    log.info({ mnemonics })
    setMnemonics(mnemonics.join(' '))
  }

  const recover = async () => {
    if (!mnemonics || !bip39.validateMnemonic(mnemonics)) {
      showErrorDialog('Invalid Mnemonic')
      return
    }

    const { getMnemonics, saveMnemonics } = await mnemonicsHelpers
    const prevMnemonics = await getMnemonics()

    try {
      // We need to try to get a new address using new mnenonics
      await saveMnemonics(mnemonics)

      // We validate that a user was registered for the specified mnemonics
      const profile = await profileExist()

      if (profile) {
        await AsyncStorage.setItem('GOODDAPP_isLoggedIn', true)

        // There is no error and Profile exists. Reload screen to start with users mnemonics
        window.location = '/'
      } else {
        await saveMnemonics(prevMnemonics)
        showErrorDialog("Mnemonic doesn't match any existing account.")
      }
    } catch (err) {
      log.error(err)
      showErrorDialog('Error recovering account', err)
      saveMnemonics(prevMnemonics)
    }
  }

  const incomingMnemonic = get(props, 'navigation.state.params.mnemonic', undefined)

  return (
    <View style={styles.wrapper}>
      <View style={styles.topContainer}>
        <View style={styles.textContainer}>
          <Paragraph style={[styles.fontBase, styles.paragraph]}>Please enter your 12-word passphrase:</Paragraph>
        </View>
        <View style={styles.formContainer}>
          <MnemonicInput recoveryMode={false} onChange={handleChange} default={incomingMnemonic} />
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
 * Helper to validate if exist a Gun profile associated to current mnemonic
 * @returns {Promise<Promise<*>|Promise<*>|Promise<any>>}
 */
async function profileExist(): Promise<any> {
  const [, userStorage] = await Promise.all([
    import('../../lib/wallet/GoodWallet').then(_ => _.default),
    import('../../lib/gundb/UserStorage').then(_ => _.default)
  ])

  // reinstantiates wallet and userStorage with new mnemonics
  await userStorage.ready

  return userStorage.userAlreadyExist()
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
