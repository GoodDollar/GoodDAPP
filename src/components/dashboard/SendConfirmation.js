// @flow
import React, { useMemo, useCallback, useState } from 'react'
import { Clipboard, StyleSheet, Text, View } from 'react-native'
import QRCode from 'qrcode.react'

import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import { generateCode } from '../../lib/share'
import { Section, Wrapper, CustomButton, TopBar, Address } from '../common'
import { fontStyle } from '../common/styles'
import { normalize } from 'react-native-elements'
import { useScreenState } from '../appNavigation/stackNavigation'

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const SEND_TITLE = 'Send GD'
const log = logger.child({ from: SEND_TITLE })

const SendConfirmation = ({ screenProps, navigation }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const [screenState, setScreenState] = useScreenState(screenProps)
  const { amount } = screenState
  const [url, setUrl] = useState()

  const code = useMemo(() => generateCode(account, networkId, amount), [account, networkId, amount])
  const copyUrl = useCallback(() => {
    Clipboard.setString(url)
    log.info('Account address copied', { url })
  }, [url])

  const share = async () => {
    log.debug('goodWallet', goodWallet)
    const url = await goodWallet.generateLink(amount)
    setUrl(url)
  }

  return (
    <Wrapper>
      <TopBar hideBalance />
      <Section style={styles.section}>
        <Section.Row style={[{}]}>
          <View style={styles.qrCode}>
            <QRCode value={code} />
          </View>
        </Section.Row>
        <View style={styles.addressSection}>
          <Section.Title>
            <Address value={url} style={styles.centered} />
          </Section.Title>
          <Section.Text style={styles.secondaryText} onPress={copyUrl}>
            Copy address to clipboard
          </Section.Text>
        </View>
        <CustomButton onPress={share} type="contained">
          Share Link
        </CustomButton>
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
