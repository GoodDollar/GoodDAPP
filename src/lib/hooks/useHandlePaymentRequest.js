import React, { useCallback } from 'react'
import { isAddress } from 'web3-utils'
import { noop } from 'lodash'

// components
import { t } from '@lingui/macro'

import { useDialog } from '../../lib/dialog/useDialog'
import { readCode } from '../../lib/share'
import { createUrlObject } from '../../lib/utils/uri'
import { getNetworkName } from '../../lib/constants/network'
import { InfoIcon } from '../../components/common/modal/InfoIcon'
import ExplanationDialog from '../../components/common/dialogs/ExplanationDialog'
import { useSwitchNetwork, useWallet } from '../../lib/wallet/GoodWalletProvider'
import { extractEthAddress } from '../../lib/wallet/utils'

export const RecipientWarnDialog = ({
  onConfirm = noop,
  onDismiss = noop,
  isDiffNetwork,
  currentNetwork,
  requestedNetwork,
}) => {
  const { switchNetwork } = useSwitchNetwork()
  const isKnownNetwork = ['FUSE', 'CELO'].includes(requestedNetwork)

  const _onConfirm = async () => {
    if (isDiffNetwork && isKnownNetwork) {
      await switchNetwork(requestedNetwork)
    }

    onConfirm()
  }

  return (
    <ExplanationDialog
      title={
        isDiffNetwork
          ? t`Warning payment requested on network ${requestedNetwork}. You are on ${currentNetwork}`
          : t`Make sure your recipient is also using the ${currentNetwork} network`
      }
      image={InfoIcon}
      imageHeight={124}
      buttons={[
        {
          text: t`Cancel`,
          action: onDismiss,
          mode: 'text',
        },
        {
          text: isDiffNetwork && isKnownNetwork ? t`Switch To ${requestedNetwork}` : t`Confirm`,
          action: _onConfirm,
        },
      ]}
    />
  )
}

export const useHandlePaymentRequest = () => {
  const { showDialog, showErrorDialog } = useDialog()
  const goodWallet = useWallet()

  const handleRequest = useCallback(
    async (linkOrEncoded, onSuccess, onError, onDismiss = noop) => {
      if (linkOrEncoded) {
        let code

        try {
          const decoded = decodeURI(linkOrEncoded)
          const { networkId = goodWallet.networkId, address } = extractEthAddress(decoded)

          code = { address, networkId }

          // handle case linkOrData is a payment request link
          if (!isAddress(address)) {
            const { params: paramsUrl } = createUrlObject(decoded)
            code = readCode(paramsUrl.code || linkOrEncoded) //could be that linkOrEncoded is already the code
          }

          const isKnownAddress = await goodWallet.isKnownAddress(code.address)
          const isDiffNetwork = goodWallet.networkId !== code.networkId
          const isOwnWallet = String(code.address).toLowerCase() === goodWallet.account.toLowerCase()

          if (isOwnWallet) {
            return showErrorDialog(t`You cannot use your own payment link`, undefined, {
              onDismiss,
            })
          }

          // this address was already used on current network, so it is ok
          if (!isKnownAddress || isDiffNetwork) {
            return showDialog({
              showButtons: false,
              onDismiss,
              content: (
                <RecipientWarnDialog
                  isDiffNetwork={isDiffNetwork}
                  currentNetwork={getNetworkName(goodWallet.networkId)}
                  requestedNetwork={getNetworkName(code.networkId)}
                  onDismiss={onDismiss}
                  onConfirm={() => onSuccess({ ...code, networkId: goodWallet.networkId })} // force current network on confirm
                />
              ),
            })
          }
          onSuccess(code)
        } catch (e) {
          onError(e, linkOrEncoded)
        }
      }
    },
    [goodWallet, showDialog],
  )

  return handleRequest
}
