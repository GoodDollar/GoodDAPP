import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { get } from 'lodash'
import * as web3Utils from 'web3-utils'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import goodWallet from '../../lib/wallet/GoodWallet'
import { AwaitButton, CustomButton, Section, Wrapper } from '../common'
import Separator from '../common/layout/Separator'
import Text from '../common/view/Text'
import OopsSVG from '../../assets/oops.svg'
import logger from '../../lib/logger/pino-logger'
import { withStyles } from '../../lib/styles'

const log = logger.child({ from: 'OutOfGasError' })

const OutOfGasError = props => {
  const { styles, theme } = props
  const MIN_BALANCE_VALUE = '100000'
  const isValid = get(props, 'screenProps.screenState.isValid', undefined)
  const ERROR = `In order for transactions to go through,
you need ‘Gas’ witch is a virtual money.
Don’t worry, we’ll take care off you.\n`
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
      log.error('verifyHasGasFailed', e.message, e)
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
          <View style={styles.image}>
            <OopsSVG />
          </View>
          <Section style={styles.mainSection}>
            <Separator style={styles.separator} width={2} />
            {isCheatError ? (
              <Text style={styles.description} fontSize={13} fontWeight={'bold'} color={theme.colors.primary}>
                <Text fontWeight={'normal'} color={theme.colors.primary}>
                  {ERROR_CHEAT}
                </Text>
              </Text>
            ) : (
              <Text style={styles.description} fontSize={13} fontWeight={'bold'} color={theme.colors.primary}>
                <Text fontWeight={'normal'} fontSize={13} color={theme.colors.primary}>
                  {ERROR}
                </Text>
                <Text fontWeight={'bold'} fontSize={13} color={theme.colors.primary}>
                  {ERROR_BOLD}
                </Text>
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
    paddingTop: getDesignRelativeHeight(theme.sizes.default),
    borderRadius: 5,
  },
  mainContainer: {
    paddingBottom: 0,
    paddingTop: 0,
    marginBottom: 0,
    flex: 1,
    marginHorizontal: getDesignRelativeWidth(0),
  },
  mainSection: {
    padding: 0,
    marginBottom: 0,
    marginHorizontal: getDesignRelativeWidth(0),
    paddingHorizontal: getDesignRelativeWidth(12),
  },
  image: {
    height: getDesignRelativeHeight(180),
  },
  separator: {
    marginHorizontal: getDesignRelativeWidth(0),
  },
  description: {
    minWidth: getDesignRelativeWidth(265),
    paddingTop: getDesignRelativeHeight(25),
    paddingBottom: getDesignRelativeHeight(25),
  },
  mainTitle: {
    fontWeight: 'bold',
    fontFamily: theme.fonts.default,
    color: theme.colors.darkGray,
    textTransform: 'none',
  },
})
export default withStyles(getStylesFromProps)(OutOfGasError)
