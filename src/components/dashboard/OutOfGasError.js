import React, { useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'
import _get from 'lodash/get'
import * as web3Utils from 'web3-utils'
import normalize from '../../lib/utils/normalizeText'
import goodWallet from '../../lib/wallet/GoodWallet'
import { AwaitButton, Section, Wrapper } from '../common'
import Separator from '../common/layout/Separator'
import Oops from '../../assets/oops.svg'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'

const log = logger.child({ from: 'OutOfGasError' })

const OutOfGasError = props => {
  const { styles } = props
  const MIN_BALANCE_VALUE = '100000'
  const isValid = _get(props, 'screenProps.screenState.isValid', undefined)

  const ERROR =
    "In·order·for·transactions·to·go·through,\nyou·need·some·virtual·money·named·'gas'.\nDon't·worry,·we'll·take·care·off·you.\n"
  const ERROR_BOLD = "We're giving it to you for FREE, FOREVER."
  const TITLE = "Ooops,\nYou're out of gas..."

  if (isValid) {
    props.screenProps.pop({ isValid })
  }

  const [isLoading, setLoading] = useState(false)

  const gotoDb = () => {
    props.screenProps.navigateTo('Home')
  }

  useEffect(() => {
    callTopWallet()
  }, [])

  const callTopWallet = async () => {
    setLoading(true)
    let isOk = false
    try {
      isOk = await goodWallet.verifyHasGas(web3Utils.toWei(MIN_BALANCE_VALUE, 'gwei'))
    } catch (e) {
      log.error(e)
    }
    setLoading(false)
    if (isOk) {
      gotoDb()
    }
  }

  log.debug(props.screenProps)

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.mainContainer} justifyContent={'space-evenly'}>
          <Section.Title style={styles.mainTitle}> {TITLE}</Section.Title>
          <Image source={Oops} resizeMode={'center'} style={styles.image} />
          <Section style={styles.mainSection}>
            <Separator style={styles.separator} width={2} />
            <Text style={styles.description}>
              <Text style={styles.errorText}>{ERROR}</Text>
              <Text>{ERROR_BOLD}</Text>
            </Text>
            <Separator style={styles.separator} width={2} />
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

const getStylesFromProps = ({ theme }) => ({
  topContainer: {
    display: 'flex',
    backgroundColor: 'white',
    height: '100%',
    flex: 1,
    flexGrow: 1,
    flexShrink: 0,
    justifyContent: 'space-evenly',
    paddingTop: 33,
    borderRadius: 5,
  },
  mainContainer: {
    paddingBottom: 0,
    paddingTop: 0,
    marginBottom: 0,
    flex: 1,
  },
  errorText: {
    fontWeight: 'normal',
  },
  mainSection: {
    padding: 0,
    marginBottom: 0,
  },
  image: {
    height: 146,
  },
  separator: {
    marginHorizontal: 12,
  },
  description: {
    fontSize: normalize(16),
    fontFamily: theme.fonts.default,
    fontWeight: 'bold',
    color: theme.colors.primary,
    paddingTop: 25,
    paddingBottom: 25,
    verticalAlign: 'text-top',
  },
  mainTitle: {
    fontFamily: theme.fonts.default,
    fontSize: 24,
    color: theme.colors.darkGray,
    textTransform: 'none',
  },
})
export default withStyles(getStylesFromProps)(OutOfGasError)
