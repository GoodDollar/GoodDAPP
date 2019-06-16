// @flow
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Paragraph } from 'react-native-paper'
import normalize from 'react-native-elements/src/helpers/normalizeText'
import { useWrappedGoodWallet } from '../../lib/wallet/useWrappedWallet'
import { WalletType } from '../../lib/wallet/GoodWallet'
import walletFactory from '../../lib/wallet/WalletFactory'
import bip39 from 'bip39-light'
import { saveMnemonics, getMnemonics } from '../../lib/wallet/SoftwareWalletProvider'
import GDStore from '../../lib/undux/GDStore'
import logger from '../../lib/logger/pino-logger'
import MnemonicInput from './MnemonicInput'
import { CustomButton } from '../common'

//const TITLE = 'Recover my wallet'
const TITLE = 'Recover'
const log = logger.child({ from: TITLE })

const Mnemonics = props => {
  const [mnemonics, setMnemonics] = useState()
  const goodWallet = useWrappedGoodWallet()
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

      // There is no error. Reload screen to start with users mnemonics
      window.location = '/'
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
