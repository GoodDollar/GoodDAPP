// @flow
import React, { useCallback, useMemo } from 'react'
import { Clipboard, StyleSheet, Text, View } from 'react-native'
import { normalize } from 'react-native-elements'
import QRCode from 'qrcode.react'

import goodWallet from '../../lib/wallet/GoodWallet'
import logger from '../../lib/logger/pino-logger'
import { generateCode } from '../../lib/share'
import { Address, CustomButton as Button, Section, Wrapper } from '../common'
import { fontStyle } from '../common/styles'
import { PushButton } from '../appNavigation/stackNavigation'
import TopBar from '../common/TopBar'

export type ReceiveProps = {
  screenProps: any,
  navigation: any
}

const RECEIVE_TITLE = 'Receive GD'

const log = logger.child({ from: RECEIVE_TITLE })

const Receive = ({ screenProps, navigation }: ReceiveProps) => {
  const { account, networkId } = goodWallet
  const amount = navigation.getParam('amount', '')

  const code = useMemo(() => generateCode(account, networkId, amount), [account, networkId, amount])

  const shareAddressAndQR = useCallback(() => log.warn('share action not yet available'))

  if (!amount) {
    const copyAddress = useCallback(() => {
      Clipboard.setString(account)
      log.info('Account address copied', { account })
    }, [account])

    return (
      <Wrapper style={styles.wrapper}>
        <TopBar hideBalance={true} />
        <Section style={styles.section}>
          <Section.Row style={styles.sectionRow}>
            <View style={styles.qrCode}>
              <QRCode value={code} />
            </View>
            <View style={styles.addressSection}>
              <Section.Text style={styles.secondaryText}>Your GD wallet address:</Section.Text>
              <Section.Title style={styles.address}>
                <Address value={account} />
              </Section.Title>
              <Section.Text style={styles.secondaryText} onPress={copyAddress}>
                Copy address to clipboard
              </Section.Text>
            </View>
            <PushButton mode="outlined" dark={false} routeName="Amount" screenProps={screenProps}>
              Request an amount
            </PushButton>
          </Section.Row>
        </Section>
        <Button mode="contained" dark={true} onPress={shareAddressAndQR}>
          Share address & QR code
        </Button>
      </Wrapper>
    )
  } else {
    return (
      <Wrapper style={styles.wrapper}>
        <Section style={styles.section}>
          <Section.Row style={[styles.sectionRow, { justifyContent: 'space-evenly' }]}>
            <View style={styles.qrCode}>
              <QRCode value={code} />
            </View>

            <View>
              <Section.Text style={styles.secondaryText}>This QR code requests exactly</Section.Text>
              <Section.Title style={styles.amountLabel}>
                {amount}
                <Text style={styles.amountSymbol}>GD</Text>
              </Section.Title>
            </View>
          </Section.Row>
        </Section>
        <Button mode="contained" dark={true} onPress={shareAddressAndQR}>
          Share QR code
        </Button>
      </Wrapper>
    )
  }
}

Receive.navigationOptions = {
  title: RECEIVE_TITLE
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'flex-start',
    width: '100%',
    padding: '1rem'
  },
  section: {
    flex: 1
  },
  sectionRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%'
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
  amountLabel: {
    ...fontStyle,
    fontSize: normalize(32)
  },
  amountSymbol: {
    fontSize: normalize(12)
  }
})

export default Receive
