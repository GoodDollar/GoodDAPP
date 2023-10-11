import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { get } from 'lodash'
import { t } from '@lingui/macro'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../lib/utils/sizes'
import { useWallet } from '../../lib/wallet/GoodWalletProvider'
import { AwaitButton, CustomButton, Section, Wrapper } from '../common'
import Separator from '../common/layout/Separator'
import Text from '../common/view/Text'
import OopsSVG from '../../assets/oops.svg'
import logger from '../../lib/logger/js-logger'
import { withStyles } from '../../lib/styles'
import useAppState from '../../lib/hooks/useAppState'
import Config from '../../config/config'
import { openLink } from '../../lib/utils/linking'

const log = logger.child({ from: 'OutOfGasError' })
const { gasFeeNotionUrl } = Config

const OutOfGasError = props => {
  const { styles, theme } = props
  const isValid = get(props, 'screenProps.screenState.isValid', undefined)
  const ERROR = t`In order for transactions to go through,
you need ‘Gas’ which is a virtual money.
Don’t worry, we’ll take care of you.`
  const ERROR_BOLD = t`We're giving it to you for FREE, FOREVER.`
  const TITLE = t`Ooops,
  You're out of gas...`
  if (isValid) {
    props.screenProps.pop({ isValid })
  }

  const goodWallet = useWallet()

  const [isLoading, setLoading] = useState(false)
  const [isCheatError, setCheatError] = useState(false)
  const { screenProps } = props

  const gotoDb = useCallback(() => screenProps.navigateTo('Home'), [screenProps])

  const gotoLearnMore = useCallback(() => openLink(gasFeeNotionUrl), [screenProps])

  useEffect(() => {
    callTopWallet()
  }, [])

  const callTopWallet = useCallback(async () => {
    let isOk = false

    setLoading(true)

    try {
      const { ok, error } = await goodWallet.verifyHasGas()

      if (error) {
        setCheatError(true)
      }

      isOk = ok
    } catch (e) {
      log.warn('verifyHasGasFailed', e.message, e)
    }

    setLoading(false)

    if (isOk) {
      gotoDb()
    }
  }, [goodWallet, setCheatError, setLoading, gotoDb])

  useAppState({ onForeground: callTopWallet })

  return (
    <Wrapper>
      <View style={styles.topContainer}>
        <Section style={styles.mainContainer} justifyContent={'space-evenly'}>
          <Section.Title style={styles.mainTitle}>{TITLE}</Section.Title>
          <View style={styles.image}>
            <OopsSVG />
          </View>
          {!isCheatError && (
            <Section style={styles.mainSection}>
              <Separator style={styles.separator} width={2} />
              <Text style={styles.description} fontSize={13} fontWeight={'bold'} color={theme.colors.primary}>
                <Text fontWeight={'regular'} fontSize={13} color={theme.colors.primary}>
                  {ERROR}
                  {`\n`}
                </Text>
                <Text fontWeight={'bold'} fontSize={13} color={theme.colors.primary}>
                  {ERROR_BOLD}
                </Text>
              </Text>
              <Separator style={styles.separator} width={2} />
            </Section>
          )}
        </Section>
        <Section>
          {isCheatError ? (
            <CustomButton onPress={gotoLearnMore}>{t`Learn about gas`}</CustomButton>
          ) : (
            <AwaitButton isLoading={isLoading} onPress={gotoDb}>
              {t`You’re good to go`}
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
