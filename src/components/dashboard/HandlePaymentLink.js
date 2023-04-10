// @flow
import React, { useCallback, useEffect } from 'react'
import { t } from '@lingui/macro'
import { Wrapper } from '../common'
import logger from '../../lib/logger/js-logger'
import { parsePaymentLinkParams } from '../../lib/share'
import { useDialog } from '../../lib/dialog/useDialog'
import LoadingIcon from '../common/modal/LoadingIcon'
import SuccessIcon from '../common/modal/SuccessIcon'
import { InfoIcon } from '../common/modal/InfoIcon'

import {
  executeWithdraw,
  WITHDRAW_STATUS_COMPLETE,
  WITHDRAW_STATUS_PENDING,
  WITHDRAW_STATUS_UNKNOWN,
} from '../../lib/wallet/utils'
import { fireEvent, WITHDRAW } from '../../lib/analytics/analytics'
import { withStyles } from '../../lib/styles'
import { decorate, ExceptionCategory, ExceptionCode } from '../../lib/exceptions/utils'
import { delay } from '../../lib/utils/async'
import { useSwitchNetwork, useUserStorage, useWallet } from '../../lib/wallet/GoodWalletProvider'
import { useHandlePaymentRequest } from '../../lib/hooks/useHandlePaymentRequest'
import { getNetworkName } from '../../lib/constants/network'
import { routeAndPathForCode } from './utils/routeAndPathForCode'

const log = logger.child({ from: 'HandlePaymentLink' })

export type HandlePaymentLinkProps = {
  screenprops: any,
  navigation: any,
  styles: any,
}

const HandlePaymentLink = (props: HandlePaymentLinkProps) => {
  const { screenProps, navigation, styles } = props
  const { params } = navigation.state || {}
  const { hideDialog, showDialog, showErrorDialog } = useDialog()
  const goodWallet = useWallet()
  const userStorage = useUserStorage()
  const handleRequest = useHandlePaymentRequest()
  const { switchNetwork } = useSwitchNetwork()

  const gotoSend = useCallback(
    async code => {
      log.info('code ok going to payment screen', { code })

      const { route, params } = await routeAndPathForCode('send', code, goodWallet, userStorage)

      hideDialog()
      screenProps.push(route, params)
    },
    [screenProps, goodWallet, userStorage, hideDialog],
  )

  const onCodeError = useCallback(
    (e, data) => {
      hideDialog()

      log.warn('Payment link is incorrect', e.message, e, {
        data,
        category: ExceptionCategory.Human,
        dialogShown: true,
      })

      showErrorDialog(t`Payment link is incorrect. Please double check your link.`, undefined, {
        onDismiss: screenProps.goToRoot,
      })
    },
    [hideDialog, showDialog],
  )

  const checkCode = useCallback(
    async anyParams => {
      try {
        if (anyParams && anyParams.code) {
          const data = decodeURIComponent(anyParams.code)

          log.debug('decoded payment request', { data })

          await handleRequest(data, gotoSend, onCodeError, screenProps.goToRoot)
        }
      } catch (e) {
        log.error('checkCode unexpected error:', e.message, e)
      }
    },
    [screenProps, showErrorDialog, goodWallet, userStorage],
  )

  const handleAppLinks = () => {
    log.debug('handle links effect HandlePaymentLink', { params })
    if (!params) {
      return
    }
    const { paymentCode, code } = params

    if (paymentCode) {
      // payment link (from send)
      handleWithdraw(params)
    } else if (code) {
      // payment request (from receive)
      checkCode(params)
    } else {
      const exception = new Error('code or paymentCode are missing.')

      log.error('handleAppLinks error:', exception.message, exception)
      screenProps.goToRoot()
    }
  }

  const handleWithdraw = useCallback(
    async params => {
      const paymentParams = parsePaymentLinkParams(params)
      const switchAndWithdraw = async network => {
        await switchNetwork(network)
        handleWithdraw(params)
      }

      try {
        if (paymentParams.networkId && paymentParams.networkId !== goodWallet.networkId) {
          return showDialog({
            onDismiss: screenProps.goToRoot,
            image: <InfoIcon />,
            title: t`Payment was created on network ${getNetworkName(
              paymentParams.networkId,
            )} you are on ${getNetworkName(goodWallet.networkId)}`,
            buttons: [
              {
                text: t`Cancel`,
                onPress: screenProps.goToRoot,
                mode: 'text',
              },
              {
                text: t`Switch to ${getNetworkName(paymentParams.networkId)}`,
                onPress: () => switchAndWithdraw(getNetworkName(paymentParams.networkId)),
              },
            ],
          })
        }

        showDialog({
          onDismiss: screenProps.goToRoot,
          title: t`Processing Payment Link...`,
          image: <LoadingIcon />,
          message: t`please wait while processing...`,
          buttons: [
            {
              text: t`YAY!`,
              style: styles.disabledButton,
              disabled: true,
            },
          ],
        })

        const { status, transactionHash } = await executeWithdraw(
          paymentParams.paymentCode,
          paymentParams.reason,
          paymentParams.category,
          goodWallet,
          userStorage,
        )

        if (transactionHash) {
          fireEvent(WITHDRAW)

          showDialog({
            onDismiss: screenProps.goToRoot,
            title: t`Payment Link Processed Successfully`,
            image: <SuccessIcon />,
            message: t`You received G$'s!`,
            buttons: [
              {
                text: t`YAY!`,
              },
            ],
          })
          return
        }

        const withdrawnOrSendError = t`Payment already withdrawn or canceled by sender`
        const wrongPaymentDetailsError = t`Wrong payment link or payment details`

        switch (status) {
          case WITHDRAW_STATUS_COMPLETE:
            log.warn('Failed to complete withdraw', withdrawnOrSendError, new Error(withdrawnOrSendError), {
              status,
              transactionHash,
              paymentParams,
              category: ExceptionCategory.Human,
              dialogShown: true,
            })
            showErrorDialog(withdrawnOrSendError, undefined, { onDismiss: screenProps.goToRoot })
            break
          case WITHDRAW_STATUS_UNKNOWN:
            for (let activeAttempts = 0; activeAttempts < 3; activeAttempts++) {
              // eslint-disable-next-line no-await-in-loop
              await delay(2000)
              // eslint-disable-next-line no-await-in-loop
              const { status } = await goodWallet.getWithdrawDetails(paymentParams.paymentCode)
              if (status === WITHDRAW_STATUS_PENDING) {
                // eslint-disable-next-line no-await-in-loop
                return await handleWithdraw(params)
              }
            }

            log.warn('Could not find payment details', wrongPaymentDetailsError, new Error(wrongPaymentDetailsError), {
              status,
              transactionHash,
              paymentParams,
              category: ExceptionCategory.Human,
              dialogShown: true,
            })

            showErrorDialog(
              t`Could not find payment details.
            Check your link or try again later.`,
              undefined,
              {
                onDismiss: screenProps.goToRoot,
              },
            )
            break
          default:
            break
        }
      } catch (exception) {
        const { message } = exception
        let uiMessage = decorate(exception, ExceptionCode.E4)

        if (message.includes('own payment')) {
          uiMessage = message
        }

        log.error('withdraw failed:', message, exception, { dialogShown: true })
        showErrorDialog(uiMessage, undefined, { onDismiss: screenProps.goToRoot })
      } finally {
        navigation.setParams({ paymentCode: undefined })
      }
    },
    [showDialog, hideDialog, showErrorDialog, navigation, goodWallet, userStorage, switchNetwork],
  )

  useEffect(() => {
    log.debug('HandlePaymentLink didmount !!!!', navigation)
    handleAppLinks()
  }, [])

  return <Wrapper backgroundColor="white" />
}

HandlePaymentLink.navigationOptions = {
  title: ' ',
  navigationBar: () => null,
}

const getStylesFromProps = ({ theme }) => ({
  disabledButton: {
    backgroundColor: theme.colors.gray50Percent,
  },
})

export default withStyles(getStylesFromProps)(HandlePaymentLink)
