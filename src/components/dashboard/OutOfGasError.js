import React, { useEffect, useState } from 'react'
import { Image, View } from 'react-native'
import _get from 'lodash/get'
import * as web3Utils from 'web3-utils'
import normalize from '../../lib/utils/normalizeText'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import goodWallet from '../../lib/wallet/GoodWallet'
import { AwaitButton, CustomButton, Section, Wrapper } from '../common'
import Separator from '../common/layout/Separator'
import Text from '../common/view/Text'
import Oops from '../../assets/oops.svg'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'

const log = logger.child({ from: 'OutOfGasError' })

const OutOfGasError = props => {
  const { styles, theme } = props
  const MIN_BALANCE_VALUE = '100000'
  const isValid = _get(props, 'screenProps.screenState.isValid', undefined)
  const ERROR =
    "In order for transactions to go through, you need some virtual money named 'gas'.Don't worry, we'll take care off you. "
  const ERROR_BOLD = "We're giving it to you for FREE, FOREVER."
  const TITLE = "Ooops,\nYou're out of gas..."
  const ERROR_CHEAT = 'Something went wrong try again later'
  if (isValid) {
    props.screenProps.pop({ isValid })
  }

  const [isLoading, setLoading] = useState(false)
  const [isCheatError, setCheatError] = useState(false)

  const gotoDb = () => {
    props.screenProps.navigateTo('Home')
  }
  const gotoSupport = () => {
    props.screenProps.navigateTo('Support')
  }

  useEffect(() => {
    callTopWallet()
  }, [])

  const callTopWallet = async () => {
    setLoading(true)
    let isOk = false
    try {
      const { ok, error } = await goodWallet.verifyHasGas(web3Utils.toWei(MIN_BALANCE_VALUE, 'gwei'))
      if (error) {
        setCheatError(true)
      }
      isOk = ok
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
          <Section.Title style={styles.mainTitle}>{TITLE}</Section.Title>
          <Image source={Oops} resizeMode={'center'} style={styles.image} />
          <Section style={styles.mainSection}>
            <Separator style={styles.separator} width={2} />
            {isCheatError ? (
              <Text style={styles.description} fontSize={16} fontWeight={'bold'} color={theme.colors.primary}>
                <Text fontWeight={'normal'}>{ERROR_CHEAT}</Text>
              </Text>
            ) : (
              <Text style={styles.description} fontSize={16} fontWeight={'bold'} color={theme.colors.primary}>
                <Text fontWeight={'normal'}>{ERROR}</Text>
                <Text>{ERROR_BOLD}</Text>
              </Text>
            )}
            <Separator style={styles.separator} width={2} />
          </Section>
        </Section>
        <Section>
          {isCheatError ? (
            <CustomButton onPress={gotoSupport}>{'Contact support'}</CustomButton>
          ) : (
            <AwaitButton isLoading={isLoading} onPress={gotoDb}>
              {"You're good to go"}
            </AwaitButton>
          )}
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
    paddingTop: getDesignRelativeHeight(33),
    borderRadius: 5,
  },
  mainContainer: {
    paddingBottom: 0,
    paddingTop: 0,
    marginBottom: 0,
    flex: 1,
  },
  mainSection: {
    padding: 0,
    marginBottom: 0,
  },
  image: {
    height: getDesignRelativeHeight(146),
  },
  separator: {
    marginHorizontal: getDesignRelativeHeight(12),
  },
  description: {
    paddingTop: getDesignRelativeHeight(25),
    paddingBottom: getDesignRelativeHeight(25),
    paddingLeft: getDesignRelativeWidth(theme.paddings.defaultMargin),
    paddingRight: getDesignRelativeWidth(theme.paddings.defaultMargin),
    verticalAlign: 'text-top',
  },
  mainTitle: {
    fontFamily: theme.fonts.default,
    fontSize: normalize(24),
    color: theme.colors.darkGray,
    textTransform: 'none',
  },
})
export default withStyles(getStylesFromProps)(OutOfGasError)
