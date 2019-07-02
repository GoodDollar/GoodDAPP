// @flow
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Paragraph } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import bip39 from 'bip39-light'
import { useErrorDialog } from '../../lib/undux/utils/dialog'
import { getMnemonics, saveMnemonics } from '../../lib/wallet/SoftwareWalletProvider'
import logger from '../../lib/logger/pino-logger'
import { CustomButton } from '../common'
import MnemonicInput from './MnemonicInput'

//const TITLE = 'Recover my wallet'
const TITLE = 'Recover'
const log = logger.child({ from: TITLE })

const Mnemonics = () => {
  const [mnemonics, setMnemonics] = useState()
  const [showErrorDialog] = useErrorDialog()

  const handleChange = (mnemonics: []) => {
    log.info({ mnemonics })
    setMnemonics(mnemonics.join(' '))
  }

  const recover = async () => {
    if (!mnemonics || !bip39.validateMnemonic(mnemonics)) {
      showErrorDialog({ message: 'Invalid Mnemonic' })
      return
    }

    const prevMnemonics = await getMnemonics()

    try {
      // We need to try to get a new address using new mnenonics
      await saveMnemonics(mnemonics)

      // We validate that a user was registered for the specified mnemonics
      const profile = await profileExist()

      if (profile) {
        // There is no error and Profile exists. Reload screen to start with users mnemonics
        window.location = '/'
      } else {
        await saveMnemonics(prevMnemonics)
        showErrorDialog({ message: 'No user registered for specified mnemonics' })
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
 * Helper to validate if exist a Gun profile associated to current mnemonic
 * @returns {Promise<Promise<*>|Promise<*>|Promise<any>>}
 */
async function profileExist(): Promise<any> {
  const [{ GoodWallet }, { UserStorage }] = await Promise.all([
    import('../../lib/wallet/GoodWallet'),
    import('../../lib/gundb/UserStorage')
  ])

  // reinstantiates wallet and userStorage with new mnemonics
  const goodWallet = new GoodWallet()
  const userStorage = new UserStorage(goodWallet)
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
