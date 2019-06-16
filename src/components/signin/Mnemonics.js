// @flow
import React, { useState } from 'react'
import { AsyncStorage, StyleSheet, View } from 'react-native'
import { Paragraph } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import bip39 from 'bip39-light'

import logger from '../../lib/logger/pino-logger'
import MnemonicInput from './MnemonicInput'
import CustomButton from '../common/CustomButton'
import { useDialog } from '../../lib/undux/utils/dialog'

//const TITLE = 'Recover my wallet'
const TITLE = 'Recover'
const log = logger.child({ from: TITLE })

const Mnemonics = props => {
  //lazy load heavy wallet stuff for fast initial app load (part of initial routes)
  const mnemonicsHelpers = import('../../lib/wallet/SoftwareWalletProvider')
  const [mnemonics, setMnemonics] = useState()
  const [showDialog, hideDialog] = useDialog()

  /**
   * TODO: check after restoring if mnemonic is of account that finished signup
   */
  const isExisting = (): Promise<boolean> => {
    return Promise.resolve(true)
  }
  const handleChange = (mnemonics: []) => {
    log.info({ mnemonics })
    setMnemonics(mnemonics.join(' '))
  }
  const recover = async () => {
    if (!mnemonics || !bip39.validateMnemonic(mnemonics)) {
      showDialog({
        visible: true,
        title: 'ERROR',
        message: 'Invalid Mnenomic',
        dismissText: 'OK'
      })
      return
    }
    const { getMnemonics, saveMnemonics } = await mnemonicsHelpers
    const prevMnemonics = await getMnemonics()
    try {
      // We need to try to get a new address using new mnenonics
      await saveMnemonics(mnemonics)
      const isLoggedIn = await isExisting()
      if (isLoggedIn === false) {
        showDialog({
          visible: true,
          title: 'Account not found',
          message: "Mnemonic doesn't match any existing account. Would you still like to continue?",
          dismissText: 'Continue',
          onCancel: () => hideDialog(),
          onDismiss: () => (window.location = '/')
        })
      }
      // There is no error. Reload screen to start with users mnemonics
      else {
        await AsyncStorage.setItem('GOODDAPP_isLoggedIn', true)
        window.location = '/'
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
