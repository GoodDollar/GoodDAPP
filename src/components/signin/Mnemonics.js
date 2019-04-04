// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Paragraph, Text, TextInput } from 'react-native-paper'
import { normalize } from 'react-native-elements'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'Mnemonics' })

const Mnemonics = () => {
  const handleChange = (text: string) => {
    const sanitizedWords = text
      .replace(/[\t\n]+/g, ' ')
      .replace(/<.*>/g, '')
      .replace(/ {2,}/g, ' ')
      .trim()
      .split(' ')

    log.log(text, sanitizedWords)
    if (sanitizedWords.length !== 12) {
      log.warn('mnemonic is based on 12 words')
    } else {
      // TODO: recover wallet with mnemonics
    }
  }
  return (
    <View style={styles.wrapper}>
      <View style={styles.topContainer}>
        <View style={styles.textContainer}>
          <Paragraph style={[styles.fontBase, styles.paragraph]}>Please enter your 12-word passphrase:</Paragraph>
        </View>

        <View style={styles.formContainer}>
          {/* TODO: this might require to be refactored to use 12 individual inputs as specified in the mocks */}
          <TextInput multiline={true} numberOfLines={4} onChangeText={handleChange} />
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Button style={[styles.buttonLayout, styles.recoverButton]} mode="contained" onPress={() => log.debug('done')}>
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
