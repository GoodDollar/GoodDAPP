// @flow
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { KeyboardAvoidingView, View } from 'react-native'
import { t } from '@lingui/macro'
import { useGetBridgeData } from '@gooddollar/web3sdk-v2'

import InputWithAdornment from '../common/form/InputWithAdornment'
import logger from '../../lib/logger/js-logger'
import { AmountInput, CustomButton, ScanQRButton, Section, Wrapper } from '../common'
import TopBar from '../common/view/TopBar'
import { BackButton, NextButton, useScreenState } from '../appNavigation/stackNavigation'
import {
  TokenContext,
  useFixedDecimals,
  useFormatToken,
  useSwitchNetwork,
  useWallet,
} from '../../lib/wallet/GoodWalletProvider'

// hooks
import usePermissions from '../permissions/hooks/usePermissions'
import { Permissions } from '../permissions/types'
import { useClipboardPaste } from '../../lib/hooks/useClipboard'

import { isIOS } from '../../lib/utils/platform'
import { withStyles } from '../../lib/styles'
import { getDesignRelativeWidth } from '../../lib/utils/sizes'
import Config from '../../config/config'
import { theme } from '../theme/styles'
import {
  ACTION_BRIDGE,
  ACTION_RECEIVE,
  ACTION_SEND,
  ACTION_SEND_TO_ADDRESS,
  navigationOptions,
} from './utils/sendReceiveFlow'

export type AmountProps = {
  screenProps: any,
  navigation: any,
  styles: any,
}

const getStylesFromProps = ({ theme }) => ({
  keyboardAvoidWrapper: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexGrow: 1,
  },
  buttonsContainer: {
    marginBottom: theme.paddings.bottomPadding,
  },
  nextButtonContainer: {
    minWidth: getDesignRelativeWidth(244),
  },
})

const { isDeltaApp } = Config

const log = logger.child({ from: 'Amount' })

const NextPageButton = ({ action, cbContinue, loading, values, ...props }) => {
  const routeMap = {
    [ACTION_BRIDGE]: ['SendLinkSummary', 'Home'],
    [ACTION_RECEIVE]: ['Reason', 'ReceiveSummary', 'TransactionConfirmation'],
    isNativeFlow: ['SendToAddress', 'SendLinkSummary'],
  }

  const nextRoute = routeMap[action] || ['Reason', 'SendLinkSummary', 'TransactionConfirmation']

  return (
    <NextButton
      contentStyle={{ justifyContent: 'flex-start' }}
      nextRoutes={nextRoute}
      canContinue={cbContinue}
      disabled={loading}
      values={values}
      action={action}
      {...props}
    />
  )
}

export const AddressDetails = ({ address, cb, error, setAddress, screenProps }) => {
  const pasteUri = useClipboardPaste(data => {
    setAddress(data)
    cb(data)
  })

  // check clipboard permission an show dialog is not allowed
  const [, requestClipboardPermissions] = usePermissions(Permissions.Clipboard, {
    requestOnMounted: false,
    onAllowed: pasteUri,
    navigate: screenProps.navigate,
  })
  const handlePastePress = useCallback(requestClipboardPermissions)
  const icon = error || address === '' ? 'paste' : 'success'
  const adornmentColor = error ? theme.colors.red : address !== '' ? theme.colors.primary : undefined

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 2, justifyContent: 'flex-end' }}>
          <View
            style={{
              borderWidth: 1,
              borderRadius: 5,
              paddingLeft: 8,
              paddingRight: 8,
              paddingTop: 12,
              borderColor: error ? 'red' : theme.colors.primary,
            }}
          >
            <InputWithAdornment
              showAdornment={true}
              adornment={icon}
              adornmentSize={icon === 'paste' ? 32 : 14}
              adornmentAction={handlePastePress}
              adornmentStyle={{
                ...(icon === 'success' && { top: 0 }),
                left: 8,
                bottom: 0,
                width: 16,
              }}
              adornmentColor={adornmentColor}
              iconAlignment="left"
              onChangeText={cb}
              value={address}
              error={error}
              placeholder="Enter Wallet Address: 0x1234..."
              style={{ borderBottomWidth: error ? 1 : 0, textAlign: 'left' }}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const Amount = (props: AmountProps) => {
  const { screenProps, styles } = props
  const { push } = screenProps
  const [screenState, setScreenState] = useScreenState(screenProps)
  const { params = {} } = props.navigation.state
  const { amount = 0, ...restState } = screenState || {}
  const goodWallet = useWallet()
  const { currentNetwork } = useSwitchNetwork()
  const { bridgeLimits } = useGetBridgeData(goodWallet.networkId, goodWallet.account)
  const { minAmount } = bridgeLimits || { minAmount: 0 }
  const { native, token, balance } = useContext(TokenContext)
  const { toDecimals, fromDecimals } = useFormatToken(token)
  const formatFixed = useFixedDecimals(token)

  const isNativeFlow = isDeltaApp && native
  const isReceive = params && params.action === ACTION_RECEIVE
  const isSend = params && params.action === ACTION_SEND
  const isBridge = params && params.action === ACTION_BRIDGE

  const bridgeState = isBridge
    ? {
        isBridge,
        network: currentNetwork,
      }
    : {}

  const [GDAmount, setGDAmount] = useState(() => (amount ? formatFixed(amount) : ''))
  const [loading, setLoading] = useState(() => !amount)
  const [error, setError] = useState()
  const [addressError, setAddressError] = useState()

  const [sendViaAddress, setSendAddress] = useState(false)
  const [address, setAddress] = useState('')

  const GDAmountInWei = useMemo(() => GDAmount && fromDecimals(GDAmount), [GDAmount])

  const handlePressQR = useCallback(() => push('SendByQR'), [push])

  const canContinue = async weiAmount => {
    if (params && params.action === ACTION_RECEIVE) {
      return true
    }

    log.info('canContiniue?', { weiAmount, balance, params })

    try {
      if (isBridge) {
        const min = parseFloat(toDecimals(minAmount))
        const canBridge = parseInt(GDAmount) >= min

        if (!canBridge) {
          setError(t`Sorry, minimum amount to bridge is ${min} ${token}'s`)
          return canBridge
        }
      }

      let canSend = await (isNativeFlow ? goodWallet.canSendNative(weiAmount) : goodWallet.canSend(weiAmount))

      if (!canSend) {
        setError(t`Sorry, you don't have enough ${token}s`)
        return canSend
      }

      if (sendViaAddress) {
        canSend = handleSendViaAddress(address)
      }

      return canSend
    } catch (e) {
      log.warn('Failed canContiniue', e.message, e)
      setError(t`Sorry, Something unexpected happened, please try again.`)
      return false
    }
  }

  const handleSendViaAddress = input => {
    setAddressError()
    setAddress(input)
    const isEth = /^0x[a-fA-F0-9]{40}$/
    const isEthAddress = isEth.test(input)
    if (!isEthAddress) {
      setAddressError(t`Sorry, this is not a valid address.`)
      return isEthAddress
    }

    setScreenState({ action: ACTION_SEND_TO_ADDRESS })
    return isEthAddress
  }

  const handleContinue = async () => {
    setLoading(true)

    setScreenState({ amount: GDAmountInWei })
    const can = await canContinue(GDAmountInWei)

    setLoading(false)

    return can
  }

  const handleAmountChange = (value: string) => {
    setGDAmount(value)
    setLoading(!value)
    setError('')
  }

  const handleRequestAddress = () => {
    setSendAddress(value => !value)
  }

  const showScanQR = !isReceive && !params?.counterPartyDisplayName // ot in receive flow and also QR wasnt displayed on Who screen

  return (
    <KeyboardAvoidingView behavior={isIOS ? 'padding' : 'height'} style={styles.keyboardAvoidWrapper}>
      <Wrapper withGradient={true}>
        <TopBar push={screenProps.push} isBridge={isBridge} network={currentNetwork}>
          {showScanQR && !isBridge && !isNativeFlow && <ScanQRButton onPress={handlePressQR} />}
        </TopBar>
        <Section grow style={styles.buttonsContainer}>
          <Section.Stack grow justifyContent="flex-start">
            <AmountInput
              maxLength={20}
              amount={GDAmount}
              handleAmountChange={handleAmountChange}
              error={error}
              title={t`How much?`}
              unit={token}
            />
          </Section.Stack>
          {isSend && (
            <Section.Stack style={{ marginBottom: 16 }}>
              <CustomButton
                icon={sendViaAddress ? 'success' : undefined}
                iconAlignment="left"
                iconColor={theme.colors.primary}
                contentStyle={{ justifyContent: 'flex-start' }}
                style={{ marginBottom: 8 }}
                color={sendViaAddress ? theme.colors.white : theme.colors.primary}
                textStyle={{ fontSize: 16, color: sendViaAddress ? theme.colors.primary : theme.colors.white }}
                onPress={handleRequestAddress}
                mode={'contained'}
                withoutDone
                noElevation
              >
                SEND VIA ADDRESS
              </CustomButton>
              {!sendViaAddress ? (
                <NextPageButton
                  action={'Send'}
                  label="SEND VIA LINK"
                  cbContinue={handleContinue}
                  loading={loading}
                  values={{ ...params, ...restState, amount: GDAmountInWei, ...bridgeState }}
                  {...props}
                />
              ) : (
                <AddressDetails
                  address={address}
                  cb={handleSendViaAddress}
                  setAddress={setAddress}
                  screenProps={screenProps}
                  error={addressError}
                />
              )}
            </Section.Stack>
          )}

          {!isSend ||
            (isSend && sendViaAddress && (
              <Section.Row>
                <Section.Row grow={1} justifyContent="flex-start">
                  <BackButton mode="text" screenProps={screenProps}>
                    {t`Cancel`}
                  </BackButton>
                </Section.Row>
                <Section.Stack grow={3} style={styles.nextButtonContainer}>
                  <NextPageButton
                    action={isNativeFlow ? 'isNative' : sendViaAddress ? ACTION_SEND_TO_ADDRESS : params.action}
                    cbContinue={handleContinue}
                    loading={loading}
                    values={{
                      amount: GDAmountInWei,
                      address: address,
                      ...params,
                      ...restState,
                      ...bridgeState,
                    }}
                    {...props}
                  />
                </Section.Stack>
              </Section.Row>
            ))}
        </Section>
      </Wrapper>
    </KeyboardAvoidingView>
  )
}

Amount.navigationOptions = navigationOptions

export default withStyles(getStylesFromProps)(Amount)
