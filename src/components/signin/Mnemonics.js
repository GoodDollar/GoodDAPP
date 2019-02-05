// @flow
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Paragraph, Text, TextInput } from 'react-native-paper'
import { normalize } from 'react-native-elements'
import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'

type Props = {
  // callback to report to parent component
  doneCallback: ({ signUp: string }) => null,
  screenProps: {
    doneCallback: ({ [string]: string }) => null
  }
}

const log = logger.child({ from: 'Mnemonics' })

class SignUpScreen extends React.Component<Props> {
  componentDidMount() {
    log.info('...', goodWallet)
  }

  handleDone = () => {
    this.props.screenProps.doneCallback({ mnemonics: 'mnemonics' })
  }

  handleChange = (text: string) => {
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

  render() {
    return (
      <View style={styles.wrapper}>
        <View styles={styles.topContainer}>
          <View style={styles.textContainer}>
            <Paragraph style={[styles.fontBase, styles.paragraph]}>Please enter your 12-word passphrase:</Paragraph>
          </View>

          <View style={styles.formContainer}>
            {/* TODO: this might require to be refactored to use 12 individual inputs as specified in the mocks */}
            <TextInput multiline={true} numberOfLines={4} onChangeText={this.handleChange} />
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.buttonsContainer}>
            <Button style={[styles.buttonLayout, styles.recoverButton]} mode="contained" onPress={this.handleDone}>
              <Text style={styles.buttonText}>RECOVER MY WALLET</Text>
            </Button>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    height: '100%',
    paddingLeft: '4%',
    paddingRight: '4%',
    justifyContent: 'space-between',
    display: 'flex',
    flex: 1,
    alignItems: 'center'
  },
  topContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'space-evenly'
  },
  formContainer: {
    marginBottom: 50,
    paddingTop: 30
  },
  bottomContainer: {
    marginBottom: 50,
    paddingTop: 30
  },
  textContainer: {
    paddingTop: '50%',
    marginTop: -30
  },
  buttonsContainer: {
    marginTop: 30
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

export default SignUpScreen
