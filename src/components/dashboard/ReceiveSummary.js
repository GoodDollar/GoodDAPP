// @flow
import React, { useMemo } from 'react'
import { Platform, View } from 'react-native'
import { isMobile } from 'mobile-device-detect'
import { Icon, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, useScreenState } from '../appNavigation/stackNavigation'
import { PushButton } from '../appNavigation/PushButton'

import goodWallet from '../../lib/wallet/GoodWallet'
import { generateCode } from '../../lib/share'
import { getDesignRelativeHeight } from '../../lib/utils/sizes'
import BigGoodDollar from '../common/view/BigGoodDollar'
import normalize from '../../lib/utils/normalizeText'
import { withStyles } from '../../lib/styles'
import { navigationOptions } from './utils/sendReceiveFlow'

export type ReceiveProps = {
  screenProps: any,
  navigation: any,
  theme: any,
}

const ReceiveAmount = ({ screenProps, styles, ...props }: ReceiveProps) => {
  const [screenState] = useScreenState(screenProps)
  const { params } = props.navigation.state

  const { amount, reason, counterPartyDisplayName } = screenState

  const { account, networkId } = goodWallet
  const codeObj = useMemo(() => generateCode(account, networkId, amount, reason, counterPartyDisplayName), [
    account,
    networkId,
    amount,
    reason,
    counterPartyDisplayName,
  ])

  const noCreds = !(counterPartyDisplayName || reason)
  const iconMarginWithoutReason = isMobile ? styles.marginForNoCredsMobile : styles.marginForNoCreds
  const amountMargin = isMobile ? styles.amountBlockMarginMobile : styles.amountBlockMargin

  return (
    <Wrapper>
      <TopBar push={screenProps.push} />
      <Section grow style={styles.section}>
        <Section.Stack grow justifyContent="center">
          {noCreds ? (
            <>
              <Section.Row justifyContent="center">
                <View style={[styles.sendIconWrapper, iconMarginWithoutReason]}>
                  <Icon name="receive" size={getDesignRelativeHeight(45)} color="white" />
                </View>
              </Section.Row>
              <Section.Stack style={amountMargin}>
                <Section.Title fontWeight="medium">YOU ARE REQUESTING</Section.Title>
                <Section.Title fontWeight="medium" style={styles.amountWrapper}>
                  <BigGoodDollar
                    number={amount}
                    color="green"
                    bigNumberProps={{
                      fontSize: 36,
                      lineHeight: 24,
                      fontFamily: 'Roboto Slab',
                      fontWeight: 'bold',
                    }}
                    bigNumberUnitProps={{ fontSize: 14 }}
                  />
                </Section.Title>
              </Section.Stack>
            </>
          ) : (
            <Section.Stack style={amountMargin}>
              <Section.Row justifyContent="center">
                <View style={styles.sendIconWrapper}>
                  <Icon name="receive" size={getDesignRelativeHeight(45)} color="white" />
                </View>
              </Section.Row>
              <Section.Title fontWeight="medium">YOU ARE REQUESTING</Section.Title>
              <Section.Row fontWeight="medium" style={styles.amountWrapper}>
                <BigGoodDollar
                  number={amount}
                  color="green"
                  bigNumberProps={{
                    fontSize: 36,
                    lineHeight: 36,
                    fontFamily: 'Roboto Slab',
                    fontWeight: 'bold',
                  }}
                  bigNumberUnitProps={{ fontSize: 14 }}
                />
              </Section.Row>
            </Section.Stack>
          )}
          <Section.Stack>
            {!!counterPartyDisplayName && (
              <Section.Row style={[styles.credsWrapper, styles.fromTextWrapper]}>
                <Section.Text color="gray80Percent" fontSize={14} style={styles.credsLabel}>
                  From
                </Section.Text>
                <Section.Text fontSize={24} fontWeight="medium" lineHeight={24}>
                  {counterPartyDisplayName}
                </Section.Text>
              </Section.Row>
            )}
            {!!reason && (
              <Section.Row style={[styles.credsWrapper, styles.reasonWrapper]}>
                <Section.Text color="gray80Percent" fontSize={14} style={styles.credsLabel}>
                  For
                </Section.Text>
                <Section.Text fontSize={normalize(14)} numberOfLines={2} ellipsizeMode="tail">
                  {reason}
                </Section.Text>
              </Section.Row>
            )}
          </Section.Stack>
        </Section.Stack>
        <Section.Row>
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3}>
            <PushButton
              routeName="ReceiveConfirmation"
              screenProps={screenProps}
              params={{ reason, amount, code: codeObj, counterPartyDisplayName, params }}
            >
              Confirm
            </PushButton>
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

ReceiveAmount.navigationOptions = navigationOptions

ReceiveAmount.shouldNavigateToComponent = props => {
  const { screenState } = props.screenProps
  return screenState.amount
}

const getStylesFromProps = ({ theme }) => ({
  section: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  amountBlockMarginMobile: {
    marginBottom: getDesignRelativeHeight(35),
  },
  amountBlockMargin: {
    marginBottom: getDesignRelativeHeight(80),
  },
  marginForNoCredsMobile: {
    marginBottom: getDesignRelativeHeight(60),
  },
  marginForNoCreds: {
    marginBottom: getDesignRelativeHeight(100),
  },
  sendIconWrapper: {
    height: getDesignRelativeHeight(75),
    width: getDesignRelativeHeight(75),
    backgroundColor: theme.colors.green,
    position: 'relative',
    borderRadius: Platform.select({
      web: '50%',
      default: getDesignRelativeHeight(75) / 2,
    }),
    marginTop: getDesignRelativeHeight(15),
    marginBottom: getDesignRelativeHeight(24),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: getDesignRelativeHeight(10),
  },
  credsWrapper: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.colors.gray50Percent,
    borderRadius: 25,
    height: 42,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: getDesignRelativeHeight(4),
    position: 'relative',
  },
  credsLabel: {
    position: 'absolute',
    top: -getDesignRelativeHeight(10),
    backgroundColor: theme.colors.white,
    paddingHorizontal: getDesignRelativeHeight(10),
    lineHeight: normalize(14),
  },
  fromTextWrapper: {
    marginBottom: getDesignRelativeHeight(24),
  },
  fromText: {
    margin: 0,
  },
  reasonWrapper: {
    alignItems: 'center',
    marginBottom: getDesignRelativeHeight(24),
  },
  warnText: {
    marginVertical: getDesignRelativeHeight(24),
  },
})

export default withStyles(getStylesFromProps)(ReceiveAmount)
