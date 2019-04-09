// @flow
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Paragraph, Text } from 'react-native-paper'
import { normalize } from 'react-native-elements'
import { useWrappedGoodWallet } from '../../lib/wallet/useWrappedWallet'
import logger from '../../lib/logger/pino-logger'
import MnemonicInput from './MnemonicInput'
import { defineProperties } from 'ethereumjs-util'

const log = logger.child({ from: 'Mnemonics' })

const Mnemonics = props => {
  const [mnemonics, setMnemonics] = useState()
  const goodWallet = useWrappedGoodWallet()
  const handleChange = (mnemonics: []) => {
    log.info({ mnemonics })
    setMnemonics(mnemonics.join(' '))
  }
  const recover = async () => {
    log.info('Mnemonics', mnemonics)
    try {
      await goodWallet.recoverWithMnemonic(mnemonics)
      props.navigation.navigate('AppNavigation')
    } catch (err) {
      log.error(err)
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
        <Button
          style={[styles.buttonLayout, styles.recoverButton]}
          mode="contained"
          onPress={recover}
          disabled={!mnemonics}
        >
          <Text style={styles.buttonText}>RECOVER MY WALLET</Text>
        </Button>
      </View>
    </View>
  )
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
    flex: 1,
    paddingTop: normalize(20),
    justifyContent: 'flex-end'
  },
  fontBase: {
    fontFamily: 'Helvetica, "sans-serif"',
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
  },
  buttonLayout: {
    marginTop: 30,
    padding: 10
  },
  buttonText: {
    fontFamily: 'Helvetica, "sans-serif"',
    fontSize: normalize(16),
    color: 'white',
    fontWeight: 'bold'
  },
  recoverButton: {
    backgroundColor: '#555555'
  }
})

export default Mnemonics
