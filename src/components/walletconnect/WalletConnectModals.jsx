// @flow
// libraries
import React, { useCallback, useMemo } from 'react'
import { Platform, ScrollView, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { t } from '@lingui/macro'
import { entries, first, mapValues, pick } from 'lodash'
import { isAddress } from 'web3-utils'
import { Icon, Image, Text } from '../common'
import QrReader from '../dashboard/QR/QRScanner'

import logger from '../../lib/logger/js-logger'
import { withStyles } from '../../lib/styles'
import { openLink } from '../../lib/utils/linking'

// hooks
import { useDialog } from '../../lib/dialog/useDialog'
import Config from '../../config/config'

const log = logger.child({ from: 'WalletConnectModals' })

const getStylesFromProps = ({ theme }) => {
  const { colors, sizes } = theme
  const { defaultDouble } = sizes
  const { lightBlue } = colors

  return {
    container: {
      width: '95%',
      alignSelf: 'center',
      ...Platform.select({
        native: {
          maxHeight: 400,
        },
      }),
    },
    header: {
      display: 'flex',
      alignItems: 'center',
    },
    detailsView: {
      width: '100%',
      marginTop: 20,
      marginBottom: 10,
      justifyContent: 'space-evenly',
      padding: 10,
      flexDirection: 'row',
      backgroundColor: '#eef0f9',
    },
    detailHeading: {
      fontSize: defaultDouble,
    },
    detail: {
      fontSize: 10,
    },

    infoView: {
      alignItems: 'flex-start',
      width: '100%',
      textAlign: 'left',
      fontSize: 14,
      ...Platform.select({
        web: {
          maxHeight: 300,
        },
        native: {
          maxHeight: 150,
        },
      }),
    },
    requestDesc: {
      marginTop: 0,
    },
    labelText: {
      color: lightBlue,
    },
    data: {
      fontSize: 14,
      width: '100%',
    },
    boldText: {
      fontWeight: 'bold',
    },
    vendorName: {
      fontSize: 20,
    },
  }
}

export const WcHeader = withStyles(getStylesFromProps)(({ styles, requestedChainId, metadata = {} }) => {
  const dappName = metadata?.name
  const dappURL = metadata?.url
  const dappIcon = first(metadata?.icons)
  const chain = requestedChainId || metadata?.chainId || Config.networkId

  return (
    <>
      <View style={styles.header}>
        <Image
          source={{ uri: dappIcon }}
          style={{
            width: 50,
            height: 'auto',
            backgroundColor: 'transparent',
            borderRadius: 18,
          }}
        />
        <Text style={styles.vendorName}>{dappName}</Text>
      </View>
      <View style={styles.detailsView}>
        <View>
          <Text style={styles.detailHeading}>{t`Website`}</Text>
          <Text style={styles.detail}>{dappURL}</Text>
        </View>
        <View>
          <Text style={styles.detailHeading}>{t`Chain`}</Text>
          <Text style={styles.detail}>{chain}</Text>
        </View>
      </View>
    </>
  )
})

export const Launch = ({ explorer, address, txHash }) => {
  const onLaunch = useCallback(() => {
    openLink(`${explorer}/` + (address ? 'address/' : 'tx/') + encodeURIComponent(address || txHash || ''))
  }, [address, explorer])

  if (!explorer || (!isAddress(address) && !txHash)) {
    return null
  }

  return <Icon name="link-ext" size={16} onPress={onLaunch} />
}

export const ContractCall = ({ styles, txJson, explorer, method }) => {
  const { decodedTx = {}, gasStatus, error, ...rest } = txJson
  const { decoded: { name, params } = {} } = decodedTx
  const txParams = entries(rest).map(([name, value]) => ({ name, value }))
  const isSign = method.includes('sign')

  // eslint-disable-next-line prettier/prettier
  const { balance, gasRequired } = useMemo(
    () => mapValues(pick(gasStatus, 'balance', 'gasRequired'), _ => _ / 1e18),
    [gasStatus],
  )

  return (
    <View style={styles.infoView}>
      {!isSign && error && gasStatus.hasEnoughGas && (
        <Text color="red" fontWeight="bold">
          {t`This transaction might fail to save gas we recommend not to execute it`}
        </Text>
      )}
      {!isSign && !gasStatus.hasEnoughGas && (
        <Text color="red" fontWeight="bold">
          {t`Not enough balance to execute transaction. Balance: ${balance} Required: ${gasRequired}`}
        </Text>
      )}
      {name && (
        <View style={styles.requestDesc}>
          <Text fontSize={16} fontWeight={'bold'}>
            Contract Call:
          </Text>
          <Text style={styles.labelText}>{t`Contract Method`}</Text>
          <Text fontSize={12} textAlign={'left'}>
            {name}
          </Text>
        </View>
      )}
      {params &&
        params.map(({ name, value }) => (
          <React.Fragment key={name}>
            <Text style={styles.labelText}>{name}</Text>
            <Text fontSize={12} textAlign={'left'}>
              {value}
              <Launch explorer={explorer} address={value} />
            </Text>
          </React.Fragment>
        ))}
      <Text fontSize={16} fontWeight={'bold'}>
        Transaction Request:
      </Text>
      {txParams.map(({ name, value }) => (
        <React.Fragment key={name}>
          <Text style={styles.labelText}>{name}</Text>
          <Text fontSize={12} textAlign={'left'}>
            {['gas', 'gasPrice', 'gasLimit', 'value', 'maxFeePerGas', 'maxPriorityFeePerGas'].includes(name)
              ? Number(value)
              : value}
            <Launch explorer={explorer} address={value} />
          </Text>
        </React.Fragment>
      ))}
    </View>
  )
}

const Approve = ({
  styles,
  metadata,
  requestedChainId,
  payload,
  message,
  modalType,
  walletAddress,
  onScan,
  explorer,
}) => {
  const requestText = useMemo(() => {
    switch (modalType) {
      default:
      case 'sign':
        return t`wants to sign this message:`
      case 'tx':
        return payload.method.includes('sign')
          ? t`wants to sign this transaction:`
          : t`wants to execute this transaction:`
      case 'connect':
        return t`wants to connect to your wallet:`
      case 'switchchain':
        return t`wants to switch chain:`
      case 'scan':
        return t`wants you to scan a QR code:`
    }
  }, [modalType])

  const labelText = useMemo(() => {
    switch (modalType) {
      default:
      case 'sign':
        return t`Message:`
      case 'connect':
        return t`Account:`
      case 'switchchain':
        return t`Chain:`
      case 'tx':
      case 'scan':
        return ''
    }
  }, [modalType])

  const displayData = useMemo(() => {
    switch (modalType) {
      case 'sign': {
        if (['eth_signTypedData', 'eth_signTypedData_v4'].includes(payload.method)) {
          const parsed = JSON.parse(message)
          delete parsed.types //dont show types to user
          return JSON.stringify(parsed, null, 4)
        }
        return message
      }
      case 'tx': {
        return <ContractCall styles={styles} txJson={message} explorer={explorer} method={payload.method} />
      }
      case 'connect':
        return walletAddress
      default:
        return message
    }
  }, [modalType])

  return (
    <View style={styles.container}>
      <WcHeader metadata={metadata} requestedChainId={requestedChainId} />
      <Text style={styles.boldText}>{requestText}</Text>
      <View style={styles.infoView}>
        <Text style={styles.labelText}>{labelText}</Text>
        <ScrollView
          style={styles.data}
          persistentScrollbar={true}
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={false}
        >
          {modalType === 'scan' && <QrReader delay={300} onError={() => {}} onScan={onScan} />}
          {['connect', 'sign', 'switchchain'].includes(modalType) && (
            <Text fontSize={12} textAlign={'left'}>
              {displayData}
            </Text>
          )}
          {modalType === 'tx' && displayData}
        </ScrollView>
      </View>
    </View>
  )
}

const ApproveModal = withStyles(getStylesFromProps)(Approve)

export const useSessionApproveModal = () => {
  const { showDialog, isDialogShown, showErrorDialog, hideDialog } = useDialog()
  const theme = useTheme()
  const { colors, sizes } = theme
  const { borderRadius } = sizes
  const { primary } = colors

  const show = useCallback(
    ({ metadata, payload, requestedChainId, message, walletAddress, onReject, onApprove, modalType, explorer }) => {
      log.debug('showing dialog', { metadata, payload, message, walletAddress, onReject, onApprove, modalType })

      if (modalType === 'error') {
        return showErrorDialog(t`Unsupported request` + ' ' + payload.method)
      }

      const afterScan = async data => {
        if (!data) {
          return
        }

        // in case of qr code scan request onApprove is sync
        const ok = await onApprove(data)

        if (!ok) {
          showErrorDialog(t`Invalid QR Value:` + ' ' + data)
        }

        hideDialog()
      }

      const approve = async dismiss => {
        // do something
        try {
          dismiss()
          await onApprove()
        } catch (e) {
          log.error('failed approving', e.message, e, { dialogShown: true, payload, modalType })
          showErrorDialog(t`Could not approve request.`, e.message)
        }
      }

      const reject = async dismiss => {
        // do something
        try {
          dismiss()
          await onReject()
        } catch (e) {
          log.error('failed rejecting', e.message, e, { dialogShown: true, payload, modalType })
          showErrorDialog(t`Could not reject request.`)
        }
      }

      try {
        showDialog({
          showCloseButtons: false,
          isMinHeight: false,
          showButtons: true,
          content: (
            <ApproveModal
              requestedChainId={requestedChainId}
              payload={payload}
              message={message}
              metadata={metadata}
              walletAddress={walletAddress}
              modalType={modalType}
              explorer={explorer}
              onScan={afterScan}
            />
          ),
          buttonsContainerStyle: {
            width: '95%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: sizes.defaultDouble,
          },
          buttons: [
            {
              text: 'Reject',
              onPress: reject,
              color: 'red',
              style: {
                width: '48%',
                color: 'blue',
                marginRight: 10,
                borderRadius,
              },
            },
            {
              text: 'Approve',
              onPress: approve,
              color: 'white',
              style: {
                borderRadius,
                width: '48%',
                backgroundColor: primary,
                display: modalType !== 'scan' ? 'flex' : 'none',
              },
            },
          ],
        })
      } catch (e) {
        log.error('failed showing dialog', e.message, e, { dialogShown: true, payload, modalType })

        showErrorDialog(t`Unable to process request:` + ' ' + e.message)
      }
    },
    [],
  )

  return { show, isDialogShown }
}
