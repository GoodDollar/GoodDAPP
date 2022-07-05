// @flow
// libraries
import React, { useCallback, useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { t } from '@lingui/macro'

import { Image, Text } from '../common'

import logger from '../../lib/logger/js-logger'
import { withStyles } from '../../lib/styles'

// components

// import { type IClientMeta } from '@walletconnect/types'

// hooks
import { useDialog } from '../../lib/dialog/useDialog'

const log = logger.child({ from: 'WalletConnectModals' })

const Approve = ({ styles, session, payload, message, modalType, walletAddress }) => {
  const dappName = session?.peerMeta?.name
  const dappURL = session?.peerMeta?.url
  const dappIcon = session?.peerMeta?.icons?.[0]
  const chainId = session?.chaindId || session?.peerMeta?.chainId || 1
  const requestText = useMemo(() => {
    switch (modalType) {
      default:
      case 'sign':
        return t`wants to sign this message:`
      case 'connect':
        return t`wants to connect to your wallet:`
    }
  }, [modalType])

  const labelText = useMemo(() => {
    switch (modalType) {
      default:
      case 'sign':
        return t`Message:`
      case 'connect':
        return t`Account:`
    }
  }, [modalType])

  const displayData = useMemo(() => {
    switch (modalType) {
      default:
      case 'sign': {
        const parsed = JSON.parse(message)
        delete parsed.types //dont show types to user
        return JSON.stringify(parsed, null, 4)
      }
      case 'tx': {
        return JSON.stringify(message, null, 4)
      }
      case 'connect':
        return walletAddress
    }
  }, [modalType])

  return (
    <View style={styles.container}>
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
          <Text style={styles.detailHeading}>{t`Wesbite`}</Text>
          <Text style={styles.detail}>{dappURL}</Text>
        </View>
        <View>
          <Text style={styles.detailHeading}>{t`Chain`}</Text>
          <Text style={styles.detail}>{chainId}</Text>
        </View>
      </View>
      <Text style={styles.boldText}>{requestText}</Text>
      <View style={styles.infoView}>
        <Text style={styles.labelText}>{labelText}</Text>
        <ScrollView style={styles.data} showsHorizontalScrollIndicator={false}>
          <Text fontSize={12} textAlign={'start'}>
            {displayData}
          </Text>
        </ScrollView>
      </View>
    </View>
  )
}

const getStylesFromProps = ({ theme }) => {
  const { colors, sizes } = theme
  const { defaultDouble } = sizes
  const { lightBlue } = colors

  return {
    container: {
      width: '95%',
      alignSelf: 'center',
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
      marginTop: 20,
      width: '100%',
      textAlign: 'start',
      fontSize: 14,
      maxHeight: 400,
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

const ApproveModal = withStyles(getStylesFromProps)(Approve)

export const useSessionApproveModal = () => {
  const { showDialog, isDialogShown, showErrorDialog } = useDialog()
  const theme = useTheme()
  const { colors, sizes } = theme
  const { borderRadius } = sizes
  const { primary } = colors

  const show = useCallback(({ session, payload, message, walletAddress, onReject, onApprove, modalType }) => {
    log.debug('showing dialog', { session, payload, message, walletAddress, onReject, onApprove, modalType })
    showDialog({
      showCloseButtons: false,
      isMinHeight: false,
      showButtons: true,
      content: (
        <ApproveModal
          payload={payload}
          message={message}
          session={session}
          walletAddress={walletAddress}
          modalType={modalType}
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
          onPress: async dismiss => {
            // do something
            try {
              await onReject()
              dismiss()
            } catch (e) {
              log.error('failed rejecting', e.message, e, { dialogShown: true, payload, modalType })
              showErrorDialog(t`Could not reject request.`)
            }
          },
          color: 'primary',
          style: {
            width: '48%',
            backgroundColor: 'transparent',
            borderRadius,
            borderWidth: 1,
            borderColor: primary,
            marginRight: 10,
          },
        },
        {
          text: 'Approve',
          onPress: async dismiss => {
            // do something
            try {
              await onApprove()
              dismiss()
            } catch (e) {
              log.error('failed approving', e.message, e, { dialogShown: true, payload, modalType })
              showErrorDialog(t`Could not approve request.`)
            }
          },
          color: 'white',
          style: {
            width: '48%',
            borderRadius,
            backgroundColor: primary,
          },
        },
      ],
    })
  }, [])

  return { show, isDialogShown }
}
