// @flow
import React, { useMemo, useCallback } from 'react'
import { Clipboard, StyleSheet, Text, View } from 'react-native'
import QRCode from 'qrcode.react'

import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import { generateCode } from '../../lib/share'
import { Section, Wrapper, CustomButton } from '../common'
import { fontStyle } from '../common/styles'
import { normalize } from 'react-native-elements'

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const SEND_TITLE = 'Send GD'
const log = logger.child({ from: SEND_TITLE })

const SendConfirmation = ({ screenProps, navigation }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const amount = navigation.getParam('amount', 0)
  const url = 'http://google.com'

  const code = useMemo(() => generateCode(account, networkId, amount), [account, networkId, amount])
  const copyUrl = useCallback(() => {
    Clipboard.setString(url)
    log.info('Account address copied', { url })
  }, [url])

  const share = async () => {
    log.debug('goodWallet', goodWallet)
    await goodWallet.generateLink()
  }

  return (
    <Wrapper>
      <Section style={styles.section}>
        <Section.Row style={[{}]}>
          <View style={styles.qrCode}>
            <QRCode value={code} />
          </View>
        </Section.Row>
        <View style={styles.addressSection}>
          <Section.Title>{url}</Section.Title>
          <Section.Text style={styles.secondaryText} onPress={copyUrl}>
            Copy address to clipboard
          </Section.Text>
        </View>
        <CustomButton onPress={share}>generate</CustomButton>
      </Section>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
    //justifyContent: 'space-between',
    alignItems: 'center'
  },
  headline: {
    ...fontStyle,
    textTransform: 'uppercase',
    marginBottom: '1rem'
  },
  qrCode: {
    marginTop: '2rem',
    padding: '1rem',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: '4px'
  },
  addressSection: {
    marginBottom: '1rem'
  },
  address: {
    margin: '0.5rem'
  },
  secondaryText: {
    margin: '1rem',
    color: '#A2A2A2',
    textTransform: 'uppercase'
  },
  buttonGroup: {
    width: '100%',
    flexDirection: 'row',
    marginTop: '1rem'
  },
  inputField: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  amountInput: {
    backgroundColor: 'transparent'
  },
  amountLabel: {
    ...fontStyle,
    fontSize: normalize(32)
  },
  amountSymbol: {
    fontSize: normalize(12)
  }
})

SendConfirmation.navigationOptions = {
  title: SEND_TITLE
}

export default SendConfirmation
