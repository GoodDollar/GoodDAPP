import React, { useCallback, useMemo, useState } from 'react'
import { Platform, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { t } from '@lingui/macro'

import { useGetBridgeData } from '@gooddollar/web3sdk-v2'

import { BackButton, useScreenState } from '../../appNavigation/stackNavigation'
import { BigGoodDollar, CustomButton, Icon, InputRounded, Section, Wrapper } from '../../common'
import BorderedBox from '../../common/view/BorderedBox'
import TopBar from '../../common/view/TopBar'
import Text from '../../common/view/Text'
import { withStyles } from '../../../lib/styles'

import { useWallet } from '../../../lib/wallet/GoodWalletProvider'
import { getDesignRelativeHeight, getDesignRelativeWidth } from '../../../lib/utils/sizes'
import { isMobile } from '../../../lib/utils/platform'
import isEmail from '../../../lib/validators/isEmail'
import normalize from '../../../lib/utils/normalizeText'
import useProfile from '../../../lib/userStorage/useProfile'
import { theme } from '../../theme/styles'

const SummaryGeneric = ({
  screenProps,
  styles,
  onConfirm,
  address,
  recipient,
  amount,
  reason,
  iconName,
  title,
  action,
  vendorInfo = undefined,
}) => {
  const { push } = screenProps

  const [screenState] = useScreenState(screenProps)

  const { isBridge, network } = screenState

  const goodWallet = useWallet()

  const { bridgeFees = {} } = useGetBridgeData(goodWallet.networkId, goodWallet.address)
  const { minFee, fee } = bridgeFees

  const minBridgeFee = Number(goodWallet.toDecimals(minFee))
  const amountInFloat = Number(goodWallet.toDecimals(amount))

  // calculate the fee in G$
  const feeinPercentage = fee ? (fee.toNumber() * 100) / 10000 : 0 //assuming bridgeFees.fee is BigNumber

  let feeToPay = (amountInFloat * feeinPercentage) / 100
  feeToPay = feeToPay < minBridgeFee ? minBridgeFee : feeToPay

  // calculate amount to receive
  const amountToReceiveInFloat = (amountInFloat - feeToPay).toString()

  const amountToReceive = goodWallet.fromDecimals(amountToReceiveInFloat)

  const altNetwork = network === 'FUSE' ? 'CELO' : 'FUSE'

  const [loading, setLoading] = useState(false)

  const { fullName, email: emailAddress } = useProfile()
  const [name, setName] = useState(fullName)
  const [email, setEmail] = useState(emailAddress)

  const isSend = useMemo(() => action === 'send')

  const iconWrapperMargin = useMemo(() => {
    return isMobile ? styles.marginForNoCredsMobile : styles.marginForNoCreds
  }, [styles])

  const [emailError, nameError] = useMemo(() => {
    let emailError = ''
    let nameError = ''

    if (vendorInfo) {
      if (email && !isEmail(email)) {
        emailError = t`Please enter a valid email address`
      }

      if (fullName && !name) {
        nameError = t`Please enter a name`
      }
    }

    return [emailError, nameError]
  }, [email, name, fullName, vendorInfo])

  const _onPress = useCallback(async () => {
    const vendorFields = vendorInfo ? { name, email } : {}

    setLoading(true)

    try {
      await onConfirm(vendorFields)
    } finally {
      setLoading(false)
    }
  }, [name, email, vendorInfo, onConfirm])

  // Custom verifier to ensure that we have all needed info
  const formHasErrors = useCallback(() => {
    // If we aren't sending, then there isn't anything that we will need to verify
    if (!vendorInfo || !isSend) {
      return false
    }

    return !name || name.trim() === '' || !email || email.trim() === ''
  }, [name, email, vendorInfo])

  const vendorInfoText = !!vendorInfo && (
    <Section.Stack style={{ alignItems: 'center' }}>
      <Section.Row>
        <Text fontSize={13}>{`Website: ${vendorInfo.website || 'NO WEBSITE PROVIDED'}`}</Text>
      </Section.Row>
      <Section.Row>
        <Text fontSize={13}>{`Invoice: ${vendorInfo.invoiceId || 'NO INVOICE DATA PROVIDED'}`}</Text>
      </Section.Row>
    </Section.Stack>
  )

  const vendorInfoWarning =
    !!vendorInfo &&
    ['* The vendor of this transaction will receive the', 'transaction details along with your name and email.'].join(
      '\n',
    )

  return (
    <Wrapper>
      <TopBar push={push} isBridge={isBridge} network={network} />
      <Section grow style={styles.section}>
        <Section.Stack>
          <Section.Row justifyContent="center">
            <View
              style={[
                styles.sendIconWrapper,
                vendorInfo ? {} : iconWrapperMargin,
                isSend ? styles.redIcon : styles.greenIcon,
              ]}
            >
              <Icon name={iconName} size={getDesignRelativeHeight(45)} color="white" />
            </View>
          </Section.Row>
          <Section.Title fontWeight="medium">{title}</Section.Title>
          <Section.Row justifyContent="center" fontWeight="medium" style={styles.amountWrapper}>
            <BigGoodDollar
              chainId={goodWallet.networkId}
              number={isBridge ? amountToReceive : amount}
              color={isSend ? 'red' : 'green'}
              bigNumberProps={{
                fontSize: 36,
                lineHeight: 36,
                fontFamily: 'Roboto Slab',
                fontWeight: 'bold',
              }}
              bigNumberUnitProps={{ fontSize: 14 }}
            />
          </Section.Row>
          {isBridge && (
            <Section.Row justifyContent="center">
              <View styles={styles.bridgeDesc}>
                <Section.Text style={{ marginBottom: 10 }}> {t` on ${altNetwork}`}</Section.Text>
                <Section.Text>{t`You'll pay ${feeToPay} G$ in fees to use the bridge`}</Section.Text>
              </View>
            </Section.Row>
          )}
        </Section.Stack>
        <Section.Stack>
          {(address || recipient) && (
            <Section.Row style={[styles.credsWrapper, reason ? styles.toTextWrapper : undefined]}>
              <Section.Text color="gray80Percent" fontSize={14} style={styles.credsLabel}>
                To
              </Section.Text>
              {address && !recipient ? (
                <Section.Text fontFamily={theme.fonts.slab} fontSize={13} lineHeight={21} style={styles.toText}>
                  {address}
                </Section.Text>
              ) : (
                recipient && (
                  <Section.Text fontSize={24} fontWeight="medium" lineHeight={28} style={styles.toText}>
                    {recipient}
                  </Section.Text>
                )
              )}
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
        {!!vendorInfo && (
          <Section.Stack style={styles.vendorInfoWrapper}>
            <Section.Separator width={20} color="transparent" style={{ zIndex: -10 }} />
            <BorderedBox
              overrideStyles={{ boxContent: { marginTop: 16, marginBottom: 16 } }}
              title="Vendor Details"
              imageSize={28}
              image={props => <Icon size={28} {...props} name="info" />}
              copyButtonText=""
              showCopyIcon={false}
              enableIndicateAction={false}
              enableSideMode={false}
              disableCopy={true}
            >
              {vendorInfoText}
              <KeyboardAwareScrollView resetScrollToCoords={{ x: 0, y: 0 }} scrollEnabled={false}>
                <Section.Row>
                  <InputRounded
                    error={nameError}
                    onChange={setName}
                    icon="username"
                    iconSize={22}
                    placeholder="Name"
                    value={name}
                    required={true}
                  />
                </Section.Row>
                <Section.Row>
                  <InputRounded
                    error={emailError}
                    onChange={setEmail}
                    icon="envelope"
                    iconSize={22}
                    placeholder="E-Mail"
                    value={email}
                  />
                </Section.Row>
                <Section.Text color="gray80Percent" fontSize={13} letterSpacing={0.07}>
                  {vendorInfoWarning}
                </Section.Text>
              </KeyboardAwareScrollView>
            </BorderedBox>
          </Section.Stack>
        )}
        {isSend && (
          <Section.Row justifyContent="center" style={styles.warnText}>
            <Section.Text color="gray80Percent">
              {t`* the transaction may take`}
              {`\n`}
              {isBridge ? t`a few minutes to complete` : t`a few seconds to complete`}
            </Section.Text>
          </Section.Row>
        )}
        <Section.Row style={styles.buttonsWrapper}>
          <Section.Row grow={1} justifyContent="flex-start">
            <BackButton mode="text" screenProps={screenProps}>
              Cancel
            </BackButton>
          </Section.Row>
          <Section.Stack grow={3} style={styles.nextButtonContainer}>
            <CustomButton disabled={formHasErrors() || loading} onPress={_onPress} loading={loading}>
              {address || isBridge ? 'Confirm' : 'Confirm & Share Link'}
            </CustomButton>
          </Section.Stack>
        </Section.Row>
      </Section>
    </Wrapper>
  )
}

const getStylesFromProps = ({ theme }) => ({
  bridgeDesc: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    color: theme.colors.darkGray,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginBottom: theme.paddings.bottomPadding,
  },
  sendIconWrapper: {
    height: getDesignRelativeHeight(75),
    width: getDesignRelativeHeight(75),
    position: 'relative',
    borderRadius: Platform.select({
      web: '50%',
      default: getDesignRelativeHeight(75) / 2,
    }),
    marginTop: getDesignRelativeHeight(15),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  redIcon: {
    backgroundColor: theme.colors.red,
    marginBottom: 75,
  },
  greenIcon: {
    backgroundColor: theme.colors.green,
  },
  amountWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: getDesignRelativeHeight(10),
    marginBottom: getDesignRelativeHeight(27),
  },
  credsWrapper: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.colors.gray50Percent,
    borderRadius: 25,
    minHeight: 42,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: getDesignRelativeHeight(4),
    paddingTop: getDesignRelativeHeight(8),
    paddingLeft: getDesignRelativeWidth(16),
    paddingRight: getDesignRelativeWidth(16),
    position: 'relative',
  },
  credsLabel: {
    position: 'absolute',
    top: -getDesignRelativeHeight(10),
    backgroundColor: theme.colors.white,
    paddingHorizontal: getDesignRelativeHeight(10),
    lineHeight: normalize(14),
  },
  vendorInfoWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  buttonsWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
  },
  toTextWrapper: {
    marginBottom: 24,
  },
  toText: {
    margin: 0,
    width: '100%',
  },
  reasonWrapper: {
    alignItems: 'center',
    paddingBottom: 0,
  },
  warnText: {
    marginVertical: getDesignRelativeHeight(24),
  },
  marginForNoCredsMobile: {
    marginBottom: getDesignRelativeHeight(60),
  },
  marginForNoCreds: {
    marginBottom: getDesignRelativeHeight(100),
  },
  nextButtonContainer: {
    minWidth: getDesignRelativeWidth(244),
  },
})

export default withStyles(getStylesFromProps)(SummaryGeneric)
