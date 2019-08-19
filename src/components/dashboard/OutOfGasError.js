import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import _get from 'lodash/get'
import * as web3Utils from 'web3-utils'
import normalize from '../../lib/utils/normalizeText'
import GDStore from '../../lib/undux/GDStore'
import goodWallet from '../../lib/wallet/GoodWallet'
import { AwaitButton, Section, Wrapper } from '../common'
import Separator from '../common/layout/Separator'
import Oops from '../../assets/oops.svg'
import logger from '../../lib/logger/pino-logger'

const log = logger.child({ from: 'OutOfGasError' })

const OutOfGasError = props => {
  const MIN_BALANCE_VALUE = '100000'
  const gdstore = GDStore.useStore()
  const isValid = _get(props, 'screenProps.screenState.isValid', undefined)

  const ERROR =
    "In·order·for·transactions·to·go·through,\nyou·need·some·virtual·money·named·'gas'.\nDon't·worry,·we'll·take·care·off·you.\n"
  const ERROR_BOLD = "We're giving it to you for FREE, FOREVER."
  const TITLE = "Ooops,\nYou're out of gas..."

  if (isValid) {
    props.screenProps.pop({ isValid })
  }

  const [isLoading, setLoading] = useState(false)
  const { balance } = gdstore.get('account')

  const gotoDb = () => {
    props.screenProps.navigateTo('Home')
  }

  useEffect(() => {
    callTopWallet()
  }, [])

  useEffect(() => {
    if (parseInt(balance) >= Number(MIN_BALANCE_VALUE)) {
      gotoDb()
    }
  }, [balance])

  const callTopWallet = async () => {
    setLoading(true)

    const isOk = await goodWallet.verifyHasGas(web3Utils.toWei(MIN_BALANCE_VALUE, 'gwei'))

    setLoading(false)

    if (isOk) {
      //gotoDb();
    }
  }

  log.debug(props.screenProps)

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section
          style={{
            paddingBottom: 0,
            paddingTop: 0,
            marginBottom: 0,
            justifyContent: 'space-evenly',
            flex: 1,
          }}
        >
          <Section.Title style={styles.mainTitle}> {TITLE}</Section.Title>
          <Image source={Oops} resizeMode={'center'} style={{ height: normalize(146) }} />
          <Section
            style={{
              padding: 0,
              marginBottom: 0,
            }}
          >
            <Separator style={{ marginHorizontal: normalize(12) }} width={2} />
            <Section.Text style={styles.description}>
              <Text style={{ fontWeight: 'normal' }}>{ERROR}</Text>
              <Text>{ERROR_BOLD}</Text>
            </Section.Text>
            <Separator style={{ marginHorizontal: normalize(12) }} width={2} />
          </Section>
        </Section>
        <Section>
          <AwaitButton isLoading={isLoading} onPress={gotoDb}>
            {"You're good to go"}
          </AwaitButton>
        </Section>
      </View>
    </Wrapper>
  )
}

OutOfGasError.navigationOptions = {
  navigationBarHidden: false,
  title: 'Out of gas',
}

const styles = StyleSheet.create({
  topContainer: {
    display: 'flex',
    backgroundColor: 'white',
    height: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    justifyContent: 'space-evenly',
    paddingTop: normalize(33),
    borderRadius: 5,
  },
  bottomContainer: {
    display: 'flex',
    flex: 1,
    paddingTop: normalize(20),
    justifyContent: 'flex-end',
  },
  description: {
    fontSize: normalize(16),
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#00AFFF',
    paddingTop: normalize(25),
    paddingBottom: normalize(25),
    verticalAlign: 'text-top',
  },
  mainTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: normalize(24),
    color: '#42454A',
    textTransform: 'none',
  },
})

export default OutOfGasError
